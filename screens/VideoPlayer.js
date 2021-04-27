import React from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Image,
    Dimensions,
    TouchableOpacity
} from "react-native";
import Video from 'react-native-video';
import config from '../config.json';
import back from "../assets/icons/back.png";

const { width, height } = Dimensions.get("window");

const VideoPlayer = ({ route, navigation }) => {

    const [kitchenVideoUrl, setKitchenVideoUrl] = React.useState(null);

    React.useEffect(() => {
        let { kitchenVideo } = route.params;
        setKitchenVideoUrl(kitchenVideo)
    }, [])

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', height: 50, backgroundColor: 'white' }}>
                <TouchableOpacity
                    style={{
                        width: 50,
                        paddingLeft: 20,
                        justifyContent: 'center'
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={back}
                        resizeMode="contain"
                        style={{
                            width: 20,
                            height: 20
                        }}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    function renderVideo() {
        return (
            <View style={{ height: height }}>
                <Video
                    controls
                    source={{ uri: config.url + kitchenVideoUrl }}
                    style={{ width: width, height: height * 0.5, marginTop: height * 0.25 }}
                />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderVideo()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black"
    },
})

export default VideoPlayer;