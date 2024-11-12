// Home.js
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import CompanyModal from '../components/Modal';
import CompanyList from '../components/companyList';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Entypo from 'react-native-vector-icons/Entypo';
import {fetchData} from '../utils';

const Home = ({navigation}) => {
  const [companies, setCompanies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCreatePress = () => {
    setModalVisible(true);
  };

  useEffect(() => {
    fetchData();
    loadCompanies();
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    await loadCompanies();
    setRefreshing(false);
  }, []);

  const loadCompanies = async () => {
    try {
      const storedData = await AsyncStorage.getItem('data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);

        setCompanies(parsedData);
      } else {
        console.log('No data found in AsyncStorage');
      }
    } catch (error) {
      console.log('Load error:', error.message);
    }
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      {companies.length > 0 ? (
        <FlatList
          data={companies}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyExtractor={company => company._id}
          renderItem={({item, index}) => (
            <CompanyList key={index} company={item} />
          )}
        />
      ) : (
        <>
          <Text style={styles.title}>Welcome to the App</Text>
          <Text style={styles.subtitle}>
            Manage your company information easily
          </Text>
        </>
      )}
      <TouchableOpacity style={styles.fab} onPress={handleCreatePress}>
        <Entypo name="plus" size={30} color="#fff" />
      </TouchableOpacity>
      <CompanyModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onRefresh={() => onRefresh()}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
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
});
