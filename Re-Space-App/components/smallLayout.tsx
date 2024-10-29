import { StyleSheet, View, Text } from "react-native";


// function with parameters
// parameter bug: https://stackoverflow.com/questions/40745992/binding-element-index-implicitly-has-an-any-type
export default function SmallLayout({ LayoutTitle }: { LayoutTitle: any }) {


    // functionality goes here


    // the component structure
    return (
        <View>
            <View style={[styles.container]}>
                {/* Icon here*/}
                <Text style={[styles.title]}>{LayoutTitle}</Text>
                {/* Image or layout here */}
            </View>
        </View>
    );
};


// css styling
const styles = StyleSheet.create({
    container: {
        width: 150,
        height: 200,
        borderRadius: 30,
        alignItems: "center",
        gap: 10,
        padding: 20,
        backgroundColor: "white",
    },
    title: {
        fontSize: 15,
        fontWeight: "bold",
        color: "black",
        textAlign: "center",
        position: "absolute",
    },
    favourite: {
        color: "yellow",
    }
});