import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const ArchiveSection = () => {
    const { deletedOrders, deliveredOrders, services, currency } = useAppContext();
    const [modalVisible, setModalVisible] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [modalImage, setModalImage] = useState('')
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };
    if (!services) {
        return <ActivityIndicator />
    }
    const renderServicesTable = (order_services,order_id) => {

        let grandTotal = 0
        const detailedServices = order_services.map((order_service, index) => {
        // console.log(order_id + '_' + index + '_' + order_service.id)
            const service = services[order_service.id];

            const total = service.type === 'perSquareMeter'
                ? Number(order_service.length) * Number(order_service.width) * Number(service.price)
                : Number(order_service.quantity) * Number(service.price);
            grandTotal = grandTotal + total
            
            return (
                <View key={order_id + '_' + index + '_' + order_service.id} style={styles.serviceRow}>
                    <Text style={styles.serviceCell}>{service.name}</Text>
                    <Text onPress={() => {
                        if (order_service.imageUrl) {
                            setShowModal(true)
                            setModalImage(order_service.imageUrl)
                        }
                    }} style={[styles.serviceCell, order_service.imageUrl ? styles.link : {}]}>{service.type === 'perSquareMeter'
                        ? order_service.length + ' x ' + order_service.width + ' m²'
                        : order_service.quantity + ' Pcs'}</Text>
                    <Text style={styles.serviceCell}>{total.toFixed(0)} {currency}</Text>

                </View>
            );

        });

        return <View key={order_id}>
            {detailedServices}
            <Text style={styles.totalLabel}>{grandTotal}{currency}</Text>
        </View>

    };
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.buttonArchive}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="archive" size={20} color="white" />
                <Text style={styles.buttonText}>عرض الأرشيف</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>الطلبات المؤرشفة</Text>
                        <ScrollView style={styles.scrollView}>
                            {deletedOrders.length > 0 || deliveredOrders.length > 0 ? (
                                <>
                                    {deletedOrders.map((item, index) => (
                                        <View key={item.id} style={styles.details}>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>الاسم الكامل:</Text>
                                            <Text style={styles.value}>{item.name}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>رقم الهاتف:</Text>
                                            <Text onPress={() => Linking.openURL(`tel:${item.phone}`)} style={[styles.value, styles.link]}>
                                                {item.phone}
                                            </Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>المكان:</Text>
                                            <Text  style={[styles.value]}>{item.location}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <Text style={styles.label}>تاريخ الطلب:</Text>
                                            <Text style={styles.value}>{formatDateTime(item.orderDate)}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={[styles.label, { color: "red" }]}>الحالة:</Text>
                                            <Text style={[styles.value, { color: "red" }]}>{item.status}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>الخدمات:</Text>

                                        </View>
                                        <View style={styles.serviceTable}>

                                            {renderServicesTable(item.services,item.id)}
                                        </View>
                                        <View style={styles.actions}>
                                            <TouchableOpacity
                                                style={[styles.button, { backgroundColor: '#FF0000'}]}
                                                onPress={() => console.log('should be deleted permanently')}
                                            >
                                                <Ionicons name="trash" size={20} color="white" />
                                                <Text style={styles.buttonText}>حذف</Text>
                                            </TouchableOpacity>

                                        </View>
                                        </View>
                                    ))}
                                    {deliveredOrders.map((item, index) => (
                                        <View key={item.id} style={styles.details}>
                                            <View style={styles.row}>
                                                <Text style={styles.label}>الاسم الكامل:</Text>
                                                <Text style={styles.value}>{item.name}</Text>
                                            </View>
                                            <View style={styles.row}>
                                                <Text style={styles.label}>رقم الهاتف:</Text>
                                                <Text onPress={() => Linking.openURL(`tel:${item.phone}`)} style={[styles.value, styles.link]}>
                                                    {item.phone}
                                                </Text>
                                            </View>
                                            <View style={styles.row}>
                                                <Text style={styles.label}>المكان:</Text>
                                                <Text style={[styles.value]}> {item.location}</Text>
                                            </View>

                                            <View style={styles.row}>
                                                <Text style={styles.label}>تاريخ الطلب:</Text>
                                                <Text style={styles.value}>{formatDateTime(item.orderDate)}</Text>
                                            </View>
                                            <View style={styles.row}>
                                                <Text style={[styles.label, { color: "green" }]}>الحالة:</Text>
                                                <Text style={[styles.value, { color: "green" }]}>{item.status}</Text>
                                            </View>
                                            <View style={styles.row}>
                                                <Text style={styles.label}>الخدمات:</Text>

                                            </View>
                                            <View style={styles.serviceTable}>

                                                {renderServicesTable(item.services, item.id)}
                                            </View>
                                            <View style={styles.actions}>
                                                <TouchableOpacity
                                                    style={[styles.button, { backgroundColor: '#FF0000' }]}
                                                    onPress={() => console.log('should be deleted permanently')}
                                                >
                                                    <Ionicons name="trash" size={20} color="white" />
                                                    <Text style={styles.buttonText}>حذف</Text>
                                                </TouchableOpacity>

                                            </View>
                                        </View>
                                    ))}
                                </>
                            ) : (
                                <Text style={styles.noOrdersText}>لا توجد طلبات مؤرشفة.</Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="close-circle" size={24} color="white" />
                            <Text style={styles.buttonText}>إغلاق</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.imageModalView}>
                        <Image source={{ uri: modalImage }} style={styles.serviceImage} />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowModal(!showModal)}
                        >
                            <Ionicons name="close-circle" size={24} color="white" />
                            <Text style={styles.buttonText}>إغلاق</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    buttonArchive: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'gray',
        borderRadius: 8,
        padding: 16,
    },
    buttonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    scrollView: {
        width: '100%',
    },
    orderItem: {
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        width: '100%',
    },
    deletedOrder: {
        borderColor: 'red',
    },
    deletedOrderText: {
        color: 'red',
    },
    deliveredOrder: {
        borderColor: 'green',
    },
    deliveredOrderText: {
        color: 'green',
    },
    orderText: {
        fontSize: 16,
        marginBottom: 8,
    },
    boldText: {
        fontWeight: 'bold',
    },
    noOrdersText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20,
    },
    closeButton: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF0000',
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
    },
    serviceInputContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    serviceLabel: {
        fontSize: 16,
        width: '30%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        width: 50,
    },
    total: {
        fontSize: 16,
        textAlign: 'right',
    },
    deleteButton: {
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }, miniServiceImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignSelf: 'center',
    },
    miniImagePickerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        borderRadius: 8,
    },
    customerItem: {
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        borderLeftWidth: 5,
        width: width * 0.8,
    },
    serviceTable: {
        flex: 1,
        marginBottom: 15,
    },
    customerItem: {
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        borderLeftWidth: 5,
        width: width * 0.8,
    },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    customerName: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    status: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: 'white',
        fontWeight: 'bold',
        marginRight: 8,
    },
    details: {
        marginTop: 8,
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        width: '40%',
        textAlign: 'right',
    },
    value: {
        width: '60%',
        textAlign: 'center',
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    actions: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    button: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        padding: 8,
    },
    buttonText: {
        color: 'white',
        marginLeft: 8,
    },
    serviceTable: {
        flex: 1,
        marginBottom: 15,
    },
    serviceRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
    },
    serviceCell: {
        width: '33%',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    serviceHeader: {
        fontWeight: 'bold',
        width: '33%',
        textAlign: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
    },
    serviceImage: {
        width: width * 0.8,
        height: width * 0.8,
    },

    modalView: {
        width: width * 0.8,
        height: height * 0.8,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    imageModalView: {
        width: width * 0.8,
        height: width * 0.5 + 100,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
    },
    buttonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
    },

});

export default ArchiveSection;
