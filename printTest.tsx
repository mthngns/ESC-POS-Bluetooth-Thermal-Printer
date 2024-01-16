/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BleManager, {BleState, Peripheral} from 'react-native-ble-manager';

const App = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Peripheral[]>([]);
  const [peripheralId, setPeripheralId] = useState(
    '37a05b02-8155-fd45-fced-3f565a80f84e',
  );
  const [bluetoothState, setBluetoothState] = useState('');

  // useEffect(() => {
  //   BleManager.start({showAlert: false})
  //     .then(() => {
  //       console.log('Module initialized');
  //     })
  //     .catch(() => {
  //       console.log('Module cant initlialized');
  //     });
  // }, []);

  const checkBluetoothState = () => {
    BleManager.checkState()
      .then(state => {
        console.log('Bluetooth State:', state);
        setBluetoothState(state);
      })
      .catch(error => {
        console.error('Error checking Bluetooth state:', error);
      });
  };

  const openBluetooth = () => {
    // Android only
    BleManager.enableBluetooth()
      .then(() => {
        console.log('Bluetooth enabled');
        // Update the Bluetooth state after enabling
        checkBluetoothState();
      })
      .catch(error => {
        console.error('Error enabling Bluetooth:', error);
        // Display an error message to the user
        Alert.alert(
          'Error',
          'Failed to enable Bluetooth. Please enable Bluetooth manually in settings.',
        );
      });
  };

  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 10, false)
        .then(() => {
          console.log('Scan started');
          setIsScanning(true);
        })
        .catch(error => {
          console.error('Error starting scan:', error);
        })
        .finally(() => {
          console.log('Scan is finished, you can scan again now.');
          setIsScanning(false);
        });
    }
  };

  const stopScan = () => {
    if (isScanning) {
      BleManager.stopScan().then(() => {
        console.log('Scan stopped');
        setIsScanning(false);
      });
    }
  };

  const connectToDevice = () => {
    if (peripheralId) {
      BleManager.connect(peripheralId)
        .then(() => {
          console.log('Connected to device:', peripheralId);
          // You can add further logic for communication with the connected device here
        })
        .catch(error => {
          console.error('Error connecting to device:', error);
        });
    } else {
      console.error(
        'No peripheralId available. Make sure to select a device from the scan results.',
      );
    }
  };

  const disConnectToDevice = () => {
    if (peripheralId) {
      BleManager.disconnect(peripheralId)
        .then(() => {
          console.log('disconnected to device:', peripheralId);
          // You can add further logic for communication with the connected device here
        })
        .catch(error => {
          console.error('Error connecting to device:', error);
        });
    } else {
      console.error(
        'No peripheralId available. Make sure to select a device from the scan results.',
      );
    }
  };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    // Log information about the discovered device
    console.log('Discovered Device:', peripheral);
    setDevices((prevDevices: Peripheral[]) => {
      // Check if the device is already in the list based on its id
      const isDeviceInList = prevDevices.some(
        device => device.id === peripheral.id,
      );

      // If the device is not in the list, add it
      if (!isDeviceInList) {
        return [...prevDevices, peripheral];
      }

      // If the device is already in the list, update its information
      return prevDevices.map(device =>
        device.id === peripheral.id ? {...device, ...peripheral} : device,
      );
    });
  };

  const discoveredPeripherals = () => {
    BleManager.getDiscoveredPeripherals().then(peripheralsArray => {
      // Success code
      console.log('Discovered peripherals: ' + peripheralsArray.length);
    });
    setIsScanning(true);
  };

  useEffect(() => {
    // Start moodule
    BleManager.start({showAlert: false})
      .then(() => {
        console.log('Module initialized');
      })
      .catch(() => {
        console.log('Module cant initlialized');
      });
    BleManager.checkState().then((state: BleState) => {
      setBluetoothState(state);
    });
    // Register the handleDiscoverPeripheral function as a listener for the 'BleManagerDiscoverPeripheral' event
    BleManager.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral,
    );
    BleManager.addListener('BleManagerDidUpdateState', args => {
      // The new state: args.state
      console.log('here : ', args.state);
      setBluetoothState(args.state);
    });
    console.log('hiiiii');
    // Return a cleanup function to remove the listener when the component unmounts
    return () => {
      BleManager.removeAllListeners('BleManagerDiscoverPeripheral');
      BleManager.removeAllListeners('BleManagerDidUpdateState');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusBar}>
          Bluetooth Status : {bluetoothState}
        </Text>
        <Text style={styles.statusBar}>{isScanning && 'Taranıyor'}</Text>
      </View>

      {/* <Button
        title="Open Bluetooth"
        color={'blue'}
        onPress={() => openBluetooth()}
      /> */}
      <Button title="Start Scan" color={'blue'} onPress={() => startScan()} />
      <Button title="Stop Scan" color={'red'} onPress={() => stopScan()} />
      <Button title="Connect to Device" onPress={() => connectToDevice()} />
      <Button
        title="Disconnect to Device"
        onPress={() => disConnectToDevice()}
      />
      <FlatList
        data={devices}
        renderItem={({item}: any) => {
          return (
            <TouchableOpacity style={styles.itemStyle}>
              <Text>{item.name || 'Unnamed Device'}</Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={item => item.id}
      />
      <Button title="Fişi Yazdır" onPress={() => printReceive()} />
      <Text>App</Text>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  statusBar: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
  },
  itemStyle: {
    backgroundColor: 'whitesmoke',
    marginBottom: 3,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
  },
});