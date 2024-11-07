import { StyleSheet, View, Text } from "react-native";
import * as Icons from '../app/indexComponents/Icons';


// function with parameters
// parameter bug: https://stackoverflow.com/questions/40745992/binding-element-index-implicitly-has-an-any-type
export default function SmallLayout({ LayoutTitle }: { LayoutTitle: any }) {

    // add image parameter when ready


    // functionality goes here


    // the component structure
    return (
        <View style={styles.layoutCard}>
          <View style={styles.layoutHeader}>
            <Icons.StarIcon />
            <Icons.StarIconOutline />
            <Text style={styles.layoutTitle}>{LayoutTitle}</Text>
          </View>
          {/* <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.layoutImage} /> */}
        </View>
    );
};


// css styling
const styles = StyleSheet.create({
    layoutCard: {
        width: '45%',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        height: 180,
        padding: 8,
        alignItems: 'center',
      },
      layoutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      },
      layoutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
      },
      layoutImage: {
        width: 80,
        height: 80,
        borderRadius: 4,
      }
});