import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Snackbar from 'react-native-snackbar';
import Entypo from 'react-native-vector-icons/Entypo';

import {calculateTotal, fetchData} from '../utils';
import colors from '../utils/colors';

const Company = ({navigation, route}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [firmName, setFirmName] = useState('');
  const {panNumber, registeredName, firms} = route.params?.company || {};
  const [topRightModal, setTopRightModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [availableFirms, setAvailableFirms] = useState(firms);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [filteredFirms, setFilteredFirms] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      let response = await fetch(
        `${process.env.PUBLIC_SERVER}/api/pan/${panNumber}`,
        {
          method: 'DELETE',
        },
      );
      if (!response) {
        console.log('Error deleting');
      }
      response = await response.json();
      Snackbar.show({
        text: response.message,
        backgroundColor: 'green',
        textColor: 'white',
      });
      navigation.navigate('Home');
    } catch (error) {
      console.log(error.message);
    }
    await onRefresh();

    setIsLoading(false);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setTopRightModal(true)}>
          <Entypo
            name="dots-three-vertical"
            color="white"
            size={30}
            style={{marginRight: 15}}
          />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View style={styles.headerContainer}>
          <Text style={styles.companyName}>{registeredName}</Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#0D1B2A',
        shadowColor: '#0D1B2A',
      },
      headerTintColor: '#FFFFFF',
    });
  }, [navigation, registeredName]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh();
    });

    return unsubscribe;
  }, [navigation]);

  const loadFirms = async () => {
    try {
      const storedData = await AsyncStorage.getItem('data');

      if (storedData) {
        const parsedData = JSON.parse(storedData);

        const filteredData = parsedData.filter(
          item => item.panNumber === panNumber,
        );
        if (filteredData.length > 0) {
          setAvailableFirms(filteredData[0].firms);
        }
      } else {
        console.log('No data found in AsyncStorage');
      }
    } catch (error) {
      console.log('Load error:', error.message);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    await loadFirms();

    setRefreshing(false);
  }, []);

  const handleAddFirm = async () => {
    if (!firmName) {
      Snackbar.show({
        text: "Firm name can't be empty",
        backgroundColor: 'red',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    try {
      setIsLoading(true);
      let response = await fetch(
        `${process.env.PUBLIC_SERVER}/api/firm/addFirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({firmName, panNumber}),
        },
      );

      if (!response) {
        throw new Error('Error adding the firm');
      }

      const responseData = await response.json();
      console.log(responseData.data.firms);

      if (responseData) {
        setAvailableFirms(responseData.data.firms);
        Snackbar.show({
          text: responseData.message,
          backgroundColor: 'green',
          textColor: 'white',
        });
      } else {
        Snackbar.show({
          text: responseData.message || 'Failed to add firm',
          backgroundColor: 'red',
          textColor: 'white',
        });
      }
    } catch (error) {
      console.log(error.message);
      Snackbar.show({
        text: error.message || 'Something went wrong!',
        backgroundColor: 'red',
        textColor: 'white',
      });
    }

    setFirmName('');
    await onRefresh();

    setIsLoading(false);

    setModalVisible(false);
  };

  const renderFirmItem = ({item}) => {
    let total = calculateTotal(item.transactions);
    return (
      <TouchableOpacity
        style={styles.firmCard}
        onPress={() => navigation.navigate('Firm', {item, panNumber})}>
        <Text style={styles.firmName}>{item.firmName}</Text>
        <Text style={styles.firmName}>{total}</Text>
      </TouchableOpacity>
    );
  };
  const calculateGrandTotal = availableFirms => {
    let grandTotal = 0;
    grandTotal = availableFirms.reduce(
      (acc, item) => acc + calculateTotal(item.transactions),
      0,
    );

    return grandTotal;
  };
  useEffect(() => {
    console.log('available firms changed');
    setFilteredFirms(availableFirms);
    setTotalAmount(calculateGrandTotal(availableFirms));
  }, [availableFirms]);

  useEffect(() => {
    console.log('screen mounted');
    onRefresh();
  }, []);

  const handleSearch = text => {
    setIsSearching(true);
    setSearchInput(text);
    if (text) {
      const results = availableFirms.filter(firm =>
        firm.firmName.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredFirms(results);
    } else {
      setFilteredFirms(availableFirms);
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search firms..."
          style={styles.input}
          value={searchInput}
          onChangeText={e => handleSearch(e)}
          placeholderTextColor={'#0D1B2A'}
        />
      </View>

      <View style={{height: hp(70)}}>
        <FlatList
          data={filteredFirms}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderFirmItem}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          ListEmptyComponent={
            <Text style={styles.noFirmsText}>No firms created yet</Text>
          }
          ListHeaderComponent={
            availableFirms.length > 0 &&
            !isSearching && (
              <View style={styles.totalContainer}>
                <View style={styles.totalHolder}>
                  <Text style={styles.totalText}>Total</Text>
                  <Entypo name="arrow-long-right" size={20} color="black" />

                  <Text style={styles.totalText}>Rs {totalAmount}</Text>
                </View>
                <View style={styles.dash}></View>
              </View>
            )
          }
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}>
        <Entypo name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Top Right Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={topRightModal}
        onRequestClose={() => setTopRightModal(false)}>
        <TouchableWithoutFeedback onPress={() => setTopRightModal(false)}>
          <View style={styles.overlay}>
            {/* TouchableWithoutFeedback inside the modal to prevent dismiss when clicking inside */}
            <TouchableWithoutFeedback>
              <View style={styles.rightModalContainer}>
                <View style={styles.rightModalItems}>
                  <TouchableOpacity>
                    <Text style={styles.rightModalText}>Update</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.rightModalItems}>
                  <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
                    <Text style={styles.rightModalText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Delete Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.deleteModalBackground}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>
              Are you sure you want to delete this company?
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>
                {isLoading ? (
                  <ActivityIndicator color={'white'} size={25} />
                ) : (
                  'Delete'
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setDeleteModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for creating a new firm */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add a New Firm</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Firm Name"
                  value={firmName}
                  onChangeText={setFirmName}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddFirm}>
                  <Text style={styles.submitButtonText}>
                    {isLoading ? (
                      <ActivityIndicator color={'white'} size={25} />
                    ) : (
                      'Add Firm'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default Company;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
    gap: 20,
  },
  searchContainer: {
    width: '100%',

    borderRadius: 10,
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    color: '#0D1B2A',
    borderColor: '#0D1B2A',
  },

  noFirmsText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
    fontSize: 16,
  },
  totalContainer: {
    marginBottom: 10,
    display: 'flex',
    gap: 10,
    width: '100%',
  },
  dash: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderBlockColor: 'black',
  },
  totalText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
  },
  totalHolder: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  firmCard: {
    backgroundColor: '#FFFFFF',

    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  firmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#0D1B2A',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: 300,
    elevation: 10,
  },
  rightModalContainer: {
    backgroundColor: '#0D1B2A',
    padding: 10,
    position: 'absolute',
    top: 0,
    right: 0,

    minWidth: 150,
  },
  rightModalItems: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  rightModalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    width: '100%',
    color: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteModalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deleteModalContainer: {
    backgroundColor: '#fff',
    padding: 20,

    borderRadius: 10,
    width: 300,
    elevation: 10,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
