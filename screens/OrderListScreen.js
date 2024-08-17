import React, { useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Modal, Alert, Dimensions, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAppContext } from '../context/AppContext';
import OrderListComponent from '../components/OrderListComponent';

const { width, height } = Dimensions.get('window');

const OrderListScreen = ({ navigation }) => {
  const { orders, updateOrderStatus, loading } = useAppContext();
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedStatus(value)}
            items={[
              { label: 'الكل', value: 'الكل' },
              { label: 'جديد', value: 'جديد' },
              { label: 'انتظار', value: 'انتظار' },
              { label: 'جاهز', value: 'جاهز' },
            ]}
            style={styles.pickerSelectStyles}
            value={selectedStatus}
          />
          <Text>{selectedStatus}</Text>
        </View>
      ),
      title: 'قائمة الطلبات',
      headerTitleAlign: 'center',
    });
  }, [navigation, selectedStatus]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.noOrdersContainer}>
        <Text style={styles.noOrdersText}>لا توجد طلبات !!!</Text>
      </View>
    );
  }

  const filterOrders = (status) => {
    const activeOrders = orders.filter((order) => order.status !== 'تم التسليم' && order.status !== 'محذوف');
    let filteredOrders = activeOrders;

    if (status !== 'الكل') {
      filteredOrders = activeOrders.filter((order) => order.status === status);
    }

    return filteredOrders.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'جديد':
        return '#FFA500'; // Orange
      case 'انتظار':
        return '#A9A9A9'; // Dark Gray
      case 'جاهز':
        return '#1e90ff'; // Light Blue
      default:
        return '#fff';
    }
  };

  const getNextStatusColor = (status) => {
    switch (status) {
      case 'جديد':
        return '#A9A9A9'; // Dark Gray (Waiting)
      case 'انتظار':
        return '#1e90ff'; // Light Blue (Ready)
      case 'جاهز':
        return '#32cd32'; // Lime Green (Delivered)
      default:
        return '#fff';
    }
  };

  const getNextStatus = (status) => {
    switch (status) {
      case 'جديد':
        return 'انتظار';
      case 'انتظار':
        return 'جاهز';
      case 'جاهز':
        return 'تم التسليم';
      default:
        return status;
    }
  };

  const filteredOrders = filterOrders(selectedStatus);

  const toggleExpandOrder = (id, index) => {
    setSelectedOrder(orders[index]);
    setExpandedOrders((prevExpandedOrders) => ({
      ...prevExpandedOrders,
      [id]: !prevExpandedOrders[id],
    }));
  };

  const handleStatusChange = (orderId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    Alert.alert(
      "تأكيد تغيير الحالة",
      `هل أنت متأكد أنك تريد تغيير الحالة إلى ${nextStatus}؟`,
      [
        {
          text: "إلغاء",
          style: "cancel"
        },
        {
          text: "موافق",
          onPress: () => updateOrderStatus(orderId, nextStatus)
        }
      ],
      { cancelable: false }
    );
  };

  const handleDeleteOrder = (order_id) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد أنك تريد حذف هذا الطلب؟",
      [
        {
          text: "إلغاء",
          style: "cancel"
        },
        {
          text: "موافق",
          onPress: () => {
            updateOrderStatus(order_id, 'محذوف');
            Alert.alert('تم', 'تم حذف الطلب بنجاح.');
          }
        }
      ],
      { cancelable: false }
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item, index) => item.id}
        renderItem={({ item, index }) => (
          <OrderListComponent
            item={item}
            index={index}
            expandedOrders={expandedOrders}
            toggleExpandOrder={toggleExpandOrder}
            handleStatusChange={handleStatusChange}
            handleDeleteOrder={handleDeleteOrder}
            formatDateTime={formatDateTime}
            getStatusColor={getStatusColor}
            getNextStatusColor={getNextStatusColor}
            getNextStatus={getNextStatus}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  noOrdersText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'gray',
  },
  pickerWrapper: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  pickerSelectStyles: {
    inputIOS: {
      fontSize: 16,
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 4,
      color: 'black',
      paddingLeft: 30,
      maxWidth: 100,
      textAlign: 'right',
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 4,
      color: 'black',
      paddingLeft: 30,
      maxWidth: 100,
      textAlign: 'right',
    },
    iconContainer: {
      top: 10,
      left: 12,
    },
  },
});

export default OrderListScreen;
