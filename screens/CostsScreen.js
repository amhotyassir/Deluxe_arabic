import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import * as Notifications from 'expo-notifications';

const { width, height } = Dimensions.get('window');

const CostsScreen = () => {
    const { costs, addCost, currency, admins, addAdmin } = useAppContext();
    const [modalVisible, setModalVisible] = useState(false);
    const [costName, setCostName] = useState('');
    const [costPrice, setCostPrice] = useState('');
    // const [filteredCosts, setFilteredCosts] = useState([]);
    const [userName, setUserName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);
    const [expoPushToken, setExpoPushToken] = useState('')

    const isDecimal = (value) => /^\d+(\.\d{1,2})?$/.test(value);

    const extractFromExpoToken = (expoToken) => {
      const regex = /\[(.*?)\]/;
      const match = expoToken.match(regex);
      return match ? match[1] : null;
    };

    useEffect(() => {
        const getExpoToken = async () => {
            const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
            setExpoPushToken(expoToken)
            const adminName = admins[extractFromExpoToken(expoToken)]?.name;
            if (adminName) {
                setUserName(adminName);
            } else {
                setShowNameInput(true);
            }
        };

        getExpoToken();
    }, [admins]);

    const handleAddCost = async () => {
        if (costName.trim() === '' || costPrice.trim() === '') {
            alert('يرجى إدخال جميع المعلومات');
            return;
        }
        if (!isDecimal(costPrice)) {
            alert('السعر يجب أن يكون رقما');
            return;
        }


        if ( showNameInput && userName.trim() === '') {
            alert('يرجى إدخال اسم المستخدم');
            return;
        }

        if (showNameInput) {
            addAdmin(extractFromExpoToken(expoPushToken), {name:userName, fullToken:String(expoPushToken)});
        }

        const newCost = {
            id: Date.now(),
            name: costName,
            price: costPrice,
            date: new Date().toLocaleDateString('en-GB'),
            user: showNameInput ? userName : admins[extractFromExpoToken(expoPushToken)].name,
        };

        addCost(newCost);
        setCostName('');
        setCostPrice('');
        setModalVisible(false);
        setShowNameInput(false)
    };

    const renderCosts = (costsToRender) => {
        if (!costsToRender || costsToRender.length === 0) {
            return <Text style={styles.noCostsText}>لا توجد تكاليف مسجلة.</Text>;
        }

        return costsToRender.map((cost) => (
            <View key={cost.id} style={styles.details}>
                <View style={styles.row}>
                    <Text style={styles.label}>اسم التكلفة:</Text>
                    <Text style={styles.value}>{cost.name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>السعر:</Text>
                    <Text style={styles.value}>{cost.price} {currency}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>التاريخ:</Text>
                    <Text style={styles.value}>{cost.date}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>المستخدم:</Text>
                    <Text style={styles.value}>{cost.user}</Text>
                </View>
            </View>
        ));
    };


    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.buttonArchive}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.buttonText}>إضافة تكلفة</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>إضافة تكلفة جديدة</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="اسم التكلفة"
                            value={costName}
                            onChangeText={setCostName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="السعر"
                            value={costPrice}
                            onChangeText={setCostPrice}
                            keyboardType="numeric"
                        />
                        {showNameInput && (
                            <TextInput
                                style={styles.input}
                                placeholder="اسم المستخدم"
                                value={userName}
                                onChangeText={setUserName}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAddCost}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="white" />
                            <Text style={styles.buttonText}>إضافة</Text>
                        </TouchableOpacity>
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

            <ScrollView style={styles.scrollView}>
                {renderCosts(costs)}
            </ScrollView>
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
    modalView: {
        width: width * 0.8,
        height: height * 0.5,
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
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    scrollView: {
        width: '100%',
        marginBottom: 40,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        width: '100%',
        marginBottom: 16,
        textAlign: 'right',
    },
    details: {
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 16,
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
    noCostsText: {
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
        padding: 5,
    },
    button: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#32cd32',
        marginBottom: 10,
    },
});

export default CostsScreen;
