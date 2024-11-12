import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {calculateTotal, fetchData} from '../utils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import colors from '../utils/colors';

const Firm = ({route, navigation}) => {
  const {firmName, transactions} = route.params.item;
  const [refreshing, setRefreshing] = useState(false);
  const {panNumber} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [availableTransactions, setAvailableTransactions] = useState(
    transactions || [],
  );
  const transactionAmountRef = useRef(null);

  const [topRightModal, setTopRightModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [transactionDeleteVisible, setTransactionDeleteVisible] =
    useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState({
    _id: '',
    transactionDate: '',
    transactionAmount: '',
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [updateFirmVisible, setUpdateFirmVisible] = useState(false);
  const [firmInputName, setFirmInputName] = useState(firmName);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      let response = await fetch(
        `${process.env.PUBLIC_SERVER}/api/pan/${panNumber}/firm/${firmName}`,
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
    } catch (error) {
      console.log(error.message);
    }
    await onRefresh();

    setIsLoading(false);
    navigation.navigate('Company', {refresh: true});
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
          <Text style={styles.firmName}>{firmName}</Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#0D1B2A',
        shadowColor: '#0D1B2A',
      },
      headerTintColor: '#FFFFFF',
    });
  }, [navigation, firmName]);

  const handleDateChange = input => {
    const cleanedInput = input.replace(/[^\d]/g, '');
    let formattedDate = cleanedInput;
    if (cleanedInput.length > 4) {
      formattedDate = `${cleanedInput.slice(0, 4)}/${cleanedInput.slice(4)}`;
    }
    if (cleanedInput.length > 6) {
      formattedDate = `${cleanedInput.slice(0, 4)}/${cleanedInput.slice(
        4,
        6,
      )}/${cleanedInput.slice(6, 8)}`;
    }
    setSelectedTransaction(prev => ({...prev, transactionDate: formattedDate}));
    setDate(formattedDate);
    if (cleanedInput.length === 8) transactionAmountRef.current?.focus();
    console.log(date);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    await loadTransactions();
    setRefreshing(false);
  }, []);
  const handleAddTransaction = async () => {
    if (!date || !transactionAmount) {
      Snackbar.show({
        text: "Fields can't be empty",
        backgroundColor: 'red',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    const newTransaction = {
      panNumber,
      firmName,
      transactionAmount,
      transactionDate: date,
    };

    try {
      setIsLoading(true);
      let response = await fetch(
        `${process.env.PUBLIC_SERVER}/api/transaction/addTransaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTransaction),
        },
      );

      if (!response.ok) {
        throw new Error('Error adding the transaction');
      }

      const responseData = await response.json();

      if (responseData) {
        // Find the specific firm by firmName (or other identifier) in the response

        const firmData = responseData.data.firms.find(
          firm => firm.firmName === firmName,
        );

        if (firmData) {
          setAvailableTransactions(firmData.transactions);

          Snackbar.show({
            text: responseData.message,
            backgroundColor: 'green',
            textColor: 'white',
            duration: Snackbar.LENGTH_SHORT,
          });
        } else {
          Snackbar.show({
            text: 'Firm not found in response',
            backgroundColor: 'red',
            textColor: 'white',
          });
        }
      } else {
        Snackbar.show({
          text: responseData.message || 'Failed to add transaction',
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

    setDate('');

    setTransactionAmount('');

    setIsLoading(false);
    setModalVisible(false);

    await onRefresh();
  };

  const loadTransactions = async () => {
    try {
      const storedData = await AsyncStorage.getItem('data');

      if (storedData) {
        const parsedData = JSON.parse(storedData);

        // Find the specific PAN entry
        const panData = parsedData.find(item => item.panNumber === panNumber);

        if (panData) {
          // Find the specific firm within that PAN
          const firmData = panData.firms.find(
            firm => firm.firmName === firmName,
          );

          if (firmData) {
            // Set available transactions for the specific firm
            setAvailableTransactions(firmData.transactions);
          } else {
            console.log('No matching firm found under the given PAN');
          }
        } else {
          console.log('No matching PAN number found');
        }
      } else {
        console.log('No data found in AsyncStorage');
      }
    } catch (error) {
      console.log('Load error:', error.message);
    }
  };

  const renderTransactionItem = ({item}) => {
    return (
      <View style={styles.firmCard}>
        <Text style={styles.transactionText}>{item.transactionDate}</Text>
        <Entypo name="arrow-long-right" size={20} color="black" />
        <Text style={styles.transactionText}>Rs {item.transactionAmount}</Text>
        <TouchableOpacity
          onPress={() => {
            setSelectedTransaction(item);
            setEditModalVisible(true);
          }}>
          <AntDesign name="edit" color="black" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectedTransaction(item);
            setTransactionDeleteVisible(true);
          }}>
          <MaterialIcons name="delete" color="black" size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  const handleDeleteTransaction = async () => {
    try {
      setIsLoading(true);
      let response = await fetch(
        `${process.env.PUBLIC_SERVER}/api/pan/${panNumber}/firm/${firmName}/transaction/${selectedTransaction._id}`,
        {
          method: 'DELETE',
        },
      );
      if (!response.ok) {
        throw new Error('Error deleting transaction');
      }
      response = await response.json();
      Snackbar.show({
        text: response.message,
        backgroundColor: 'green',
        textColor: 'white',
      });
      setTransactionDeleteVisible(false); // Close modal after deletion
      await onRefresh(); // Refresh transaction list
    } catch (error) {
      console.log(error.message);
      Snackbar.show({
        text: error.message || 'Something went wrong!',
        backgroundColor: 'red',
        textColor: 'white',
      });
    }
    setIsLoading(false);
  };
  const handleEditTransaction = async () => {
    setDate(selectedTransaction.transactionDate);

    if (!date || !transactionAmount) {
      Snackbar.show({
        text: "Don't leave the fields empty",
        backgroundColor: 'red',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    try {
      setIsLoading(true);
      let response = await fetch(
        `${process.env.PUBLIC_SERVER}/api/pan/${panNumber}/firm/${firmName}/transaction/${selectedTransaction._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionDate: date,
            transactionAmount,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Error Updating transaction');
      }
      response = await response.json();
      Snackbar.show({
        text: response.message,
        backgroundColor: 'green',
        textColor: 'white',
      });

      await onRefresh();
    } catch (error) {
      console.log(error.message);
      Snackbar.show({
        text: error.message || 'Something went wrong!',
        backgroundColor: 'red',
        textColor: 'white',
      });
    }
    setDate('');
    setTransactionAmount('');
    setIsLoading(false);
    setEditModalVisible(false);
  };
  const handleUpdateFirm = async () => {
    if (!firmInputName) {
      Snackbar.show({
        text: "Don't leave the fields empty",
      });
    }
    try {
      setIsLoading(true);
      let response = await fetch(
        `${process.env.PUBLIC_SERVER}/api/pan/${panNumber}/firm/${firmName}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newFirmName: firmInputName,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Error Updating transaction');
      }
      response = await response.json();
      await onRefresh();
      Snackbar.show({
        text: response.message,
        backgroundColor: 'green',
        textColor: 'white',
      });
    } catch (error) {
      console.log(error.message);
      Snackbar.show({
        text: error.message || 'Something went wrong!',
        backgroundColor: 'red',
        textColor: 'white',
      });
    }
    setFirmInputName('');
    setIsLoading(false);

    setUpdateFirmVisible(false);
  };

  let total = calculateTotal(availableTransactions);

  useEffect(() => {
    loadTransactions();
  }, []);
  useEffect(() => {
    console.log(date, transactionAmount);
    setTotalAmount(total);
  }, [availableTransactions]);
  return (
    <View style={styles.container}>
      <View style={{height: hp(80)}}>
        <FlatList
          data={availableTransactions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderTransactionItem}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          ListEmptyComponent={
            <Text style={styles.noFirmsText}>No Transactions created yet</Text>
          }
          ListHeaderComponent={
            availableTransactions.length > 0 && (
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
      {/* Modal top right */}
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
                  <TouchableOpacity onPress={() => setUpdateFirmVisible(true)}>
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

      {/* Modal delete */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.deleteModalBackground}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>
              Are you sure you want to delete this Firm?
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

      {/* Modal create transaction */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add a New Transaction</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY/MM/DD"
                  keyboardType="numeric"
                  placeholderTextColor="black"
                  value={date}
                  onChangeText={handleDateChange}
                  maxLength={10}
                />
                <TextInput
                  style={styles.input}
                  ref={transactionAmountRef}
                  placeholder="Enter transaction amount"
                  placeholderTextColor="black"
                  value={transactionAmount}
                  keyboardType="numeric"
                  onChangeText={setTransactionAmount}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddTransaction}>
                  <Text style={styles.submitButtonText}>
                    {isLoading ? (
                      <ActivityIndicator color={'white'} size={25} />
                    ) : (
                      'Create'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Transaction Delete */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={transactionDeleteVisible}
        onRequestClose={() => setTransactionDeleteVisible(false)}>
        <View style={styles.deleteModalBackground}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>
              Are you sure you want to delete this transaction?
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteTransaction}>
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
              onPress={() => setTransactionDeleteVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal update Trasaction */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Update Transaction</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY/MM/DD"
                  keyboardType="numeric"
                  placeholderTextColor="black"
                  value={(selectedTransaction || {}).transactionDate || ''}
                  onChangeText={handleDateChange}
                  maxLength={10}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter transaction amount"
                  placeholderTextColor="black"
                  value={(selectedTransaction || {}).transactionAmount || ''}
                  keyboardType="numeric"
                  onChangeText={setTransactionAmount}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleEditTransaction}>
                  <Text style={styles.submitButtonText}>
                    {isLoading ? (
                      <ActivityIndicator color={'white'} size={25} />
                    ) : (
                      'Update'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal update Firm */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={updateFirmVisible}
        onRequestClose={() => setUpdateFirmVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setUpdateFirmVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Update Firm</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter the Firm Name"
                  placeholderTextColor="black"
                  value={firmInputName}
                  onChangeText={setFirmInputName}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleUpdateFirm}>
                  <Text style={styles.submitButtonText}>
                    {isLoading ? (
                      <ActivityIndicator color={'white'} size={25} />
                    ) : (
                      'Update'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}>
        <Entypo name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Firm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
  },

  totalContainer: {
    display: 'flex',
    gap: 10,
    width: '100%',
    marginBottom: 10,
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
  noFirmsText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
    fontSize: 16,
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
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: 300,
    elevation: 10,
  },
  rightModalContainer: {
    backgroundColor: colors.primary,
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
    color: colors.primary,
  },
  headerContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  firmName: {
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
  transactionText: {
    color: colors.primary,
  },
});
