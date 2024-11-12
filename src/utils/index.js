import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchData = async () => {
  try {
    let payload = await fetch(`${process.env.PUBLIC_SERVER}/api/getAllData`);
    if (!payload.ok) {
      throw new Error('Error fetching the data');
    }
    payload = await payload.json();
    await AsyncStorage.setItem('data', JSON.stringify(payload.data));
  } catch (error) {
    console.log('Fetch error:', error.message);
  }
};
export const calculateTotal = availableTransactions => {
  if (!Array.isArray(availableTransactions)) {
    console.error('Transactions should be an array');
    return 0;
  }
  const total = availableTransactions.reduce((sum, transaction) => {
    return sum + (transaction.transactionAmount || 0);
  }, 0);

  return total;
};
