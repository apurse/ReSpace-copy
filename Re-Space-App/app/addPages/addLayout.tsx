import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';

import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import Furniture from '@/components/LayoutComponents/furniture';
import ActionButton from '@/components/settingsComponents/actionButton';


// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

// -------- Grid Visuals --------

const roomSize = [600, 900];
const gridSize = [0.8 * width, 0.55 * height];

const robotDimensions = [50, 50];
const gridSpaceSize = [robotDimensions];

var scaleX = roomSize[0] / gridSize[0];
var scaleY = roomSize[1] / gridSize[1];



export default function AddLayout() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);


  // do grid as visual set to robot size
  // if overhang, count as "dead space" and maybe fill in black?
  // snapping works but not to grid, make snapping add few mm as gap

  // width of each grid box = largest item squared
  // add rotate button

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Add Layout</Text>
      </View>

      <View style={uniqueStyles.grid}>
        <Furniture
          gridDimensions={gridSize}  // very cheap fix, could be better
          furnitureName="Table"
          furnitureID="240"
        />
        <Furniture
          gridDimensions={gridSize}
          furnitureName="Table"
          furnitureID="230"
        />
      </View>
      {/* Need scale measurement */}

      <View style={uniqueStyles.buttonContainer}>


        <ActionButton
          label="Save Layout"
          onPress={() => alert("Todo...")}
        />

        <ActionButton
          label="Ready To Go!"
          onPress={() => alert("Todo...")}
        />
      </View>

    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({

    grid: {
      width: gridSize[0], // * scaleX once visuals are done
      height: gridSize[1], // * scaleY once visuals are done
      backgroundColor: '#D3D3D3',
    },
    buttonContainer: {
      width: gridSize[0],
    }

  });
