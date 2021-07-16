import React from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    Linking
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import back from "../assets/icons/back.png";
import KitPin from '../assets/icons/hamburger.png'
import config from '../config.json';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import Bar from 'react-native-progress/Bar';

const { width, height } = Dimensions.get("window");

const KitchenDetails = ({ route, navigation }) => {

    const [kitchen, setKitchen] = React.useState({latitude: 0, longitude: 0});
    const mapView = React.useRef()
    const [region, setRegion] = React.useState(null)
    const [reviews, setReviews] = React.useState()
    const [ratingsCount, setRatingsCount] = React.useState([])
    const [height, setHeight] = React.useState(301)
    const [scrollViewRef, setScrollViewRef] = React.useState();

    React.useEffect(() => {
        let { kitchen, reviews, scrollToReviews } = route.params;
        setReviews(reviews)
        setKitchen(kitchen)
        countRatings(reviews)

        let mapRegion = {
            latitude: kitchen.latitude,
            longitude: kitchen.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025
        }
        setRegion(mapRegion)

        setTimeout(() => {
            setHeight(300)
        }, 100);

        if (scrollToReviews) {
            scrollViewRef?.scrollTo({ x: 0, y: 1200, animated: true })
        }
    }, [scrollViewRef])

    function countRatings(reviews) {
        let temp = []
        for(let i = 5; i >=1; i--) {
            let count =  reviews.filter(review => review.ratings == i)
            temp.push(count.length)
        }
        setRatingsCount(temp)
    }

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', height: 50 }}>
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

    function renderKitchenInfo() {
        return (
            <View style={{ alignItems: 'center' }}>
                <TouchableOpacity 
                    style={{ height: 200, borderRadius: 200, borderWidth: 2, ...styles.shadow, borderColor: 'white', marginTop: 10 }}
                    onPress={() => navigation.navigate("VideoPlayer", {
                        kitchenVideo: kitchen.video,
                    })}
                >
                    <Image
                        source={{ uri: config.url + kitchen?.chefDp }}
                        resizeMode="cover"
                        style={{
                            width: 200,
                            height: "100%",
                            borderRadius: 200,
                        }}
                    />
                </TouchableOpacity>

                <View
                    style={{
                        width: width,
                        alignItems: 'center',
                        marginTop: 15,
                        paddingHorizontal: 20
                    }}
                >
                    <Text style={{ marginVertical: 10, textAlign: 'center', fontFamily: "System", fontSize: 26, lineHeight: 30, fontWeight: 'bold' }}>{kitchen?.kitName}</Text>
                    <Text style={{ fontFamily: "System", fontSize: 16, lineHeight: 22, color: 'gray' }}>{kitchen?.description}kiursctheri ceriuyfrekuif rjekghcfkreufc geiuygt fskjgeru rgfjer fuyegfjhregf</Text>
                </View>

                <View style={{
                    marginTop: 20,
                    flexDirection: 'row',
                    maxWidth: width * 0.8
                }}>
                    <FAIcon name="address-book" size={33} color="skyblue" />
                    <Text style={{ fontFamily: "System", fontSize: 16, marginLeft: 20, color: 'gray' }}>{kitchen?.address}, Floor - {kitchen?.floorNo}</Text>
                </View>

                <View style={{
                    marginTop: 20,
                    flexDirection: 'row'
                }}>
                    <FAIcon name="phone-square" size={35} color="skyblue" />
                    <Text style={{ fontFamily: "System", fontSize: 20, lineHeight: 33, marginLeft: 20 }}>+91 {kitchen?.paytmNo}</Text>
                </View>
            </View>
        )
    }

    function renderLocation() {
        return (
            <View style={{ width: width, height: height, marginTop: 40 }}>
                <MapView
                    ref={mapView}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={region}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    style={{ width: width, height: 300 }}
                >
                    <Marker
                        coordinate={{ latitude: kitchen?.latitude, longitude: kitchen?.longitude }}
                        key={kitchen?.id}
                        title={kitchen?.kitName}
                    >
                        <Image source={KitPin}
                            style={{
                                width: 40,
                                height: 40,
                            }}
                        />
                    </Marker>
                </MapView>
            </View>
        )
    }

    function renderYouTubeReview() {
        return (
            <View>
                <View style={{ padding: 40 }}>
                    <Text style={{ fontFamily: "System", fontSize: 18, marginBottom: 10 }}>Reviews By YouTube Page ABCD :</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14, color: 'gray', fontStyle: 'italic', marginBottom: 5 }}>{kitchen.youTubeReview}</Text>
                    <Text style={{ fontFamily: "System", fontSize: 14, color: 'gray', marginBottom: 5 }}>Excited to see the Interview Video? Checkout the Link:</Text>
                    <Text style={{ color: 'blue' }}
                        onPress={() => Linking.openURL(kitchen.youTubeLink)}>
                        {kitchen.youTubeLink}
                    </Text>
                </View>
                <View style={{
                    alignSelf: 'center',
                    width: width * 0.9,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: '#F5F5F6',
                }}></View>
            </View>
        )
    }

    function renderReviesAndRatings() {
        return (
            <View style={{padding: 20}}>
                <View style={{flexDirection: 'row', width: width*0.9, borderWidth: 1, borderRadius: 20, borderColor: 'white', padding: 10, alignSelf: 'center', ...styles.shadow, backgroundColor: 'white', marginBottom: 30 }}>
                    <View style={{width: "45%", alignItems: 'center'}}>
                        <Text style={{fontSize: 50}}>
                            {kitchen.avgrating}
                            <FAIcon name="star" size={50} color="gold" />
                        </Text>
                        <Text>Average Ratings</Text>
                        <Text style={{fontSize: 12}}>(Based on {reviews?.length} ratings)</Text>
                    </View>
                    <View style={{justifyContent:'center'}}>
                        <Text>5 Star  <Bar progress={reviews?.length > 0 ? ratingsCount[0]/reviews?.length : 0} width={width*0.25} color={'gold'} />  {ratingsCount[0]}</Text>
                        <Text>4 Star  <Bar progress={reviews?.length > 0 ? ratingsCount[1]/reviews?.length : 0} width={width*0.25} color={'gold'} />  {ratingsCount[1]}</Text>
                        <Text>3 Star  <Bar progress={reviews?.length > 0 ? ratingsCount[2]/reviews?.length : 0} width={width*0.25} color={'gold'} />  {ratingsCount[2]}</Text>
                        <Text>2 Star  <Bar progress={reviews?.length > 0 ? ratingsCount[3]/reviews?.length : 0} width={width*0.25} color={'gold'} />  {ratingsCount[3]}</Text>
                        <Text>1 Star  <Bar progress={reviews?.length > 0 ? ratingsCount[4]/reviews?.length : 0} width={width*0.25} color={'gold'} />  {ratingsCount[4]}</Text>
                    </View>
                </View>
                {reviews?.map(review => {
                    return (
                        <View key={review.id} style={{padding: 20}}>
                            <View style={{flexDirection: 'row'}}>
                                <FAIcon name="user-circle" size={25} color="gray" />
                                <Text style={{ fontFamily: "System", fontSize: 18, marginLeft: 10, fontWeight: 'bold' }}>{review?.user.first_name} {review?.user.last_name}</Text>
                            </View>
                            <View style={{flexDirection: 'row', marginTop: 10}}>
                                {review.ratings >= 1 ?
                                <FAIcon name="star" size={20} color="gold" />
                                :
                                <FAIcon name="star-o" size={20} color="gold" />
                                }
                                {review.ratings >= 2 ?
                                <FAIcon name="star" size={20} color="gold" />
                                :
                                <FAIcon name="star-o" size={20} color="gold" />
                                }
                                {review.ratings >= 3 ?
                                <FAIcon name="star" size={20} color="gold" />
                                :
                                <FAIcon name="star-o" size={20} color="gold" />
                                }
                                {review.ratings >= 4 ?
                                <FAIcon name="star" size={20} color="gold" />
                                :
                                <FAIcon name="star-o" size={20} color="gold" />
                                }
                                {review.ratings >= 5 ?
                                <FAIcon name="star" size={20} color="gold" />
                                :
                                <FAIcon name="star-o" size={20} color="gold" />
                                }
                            </View>
                            <View>
                                <Text style={{ fontFamily: "System", fontSize: 16, marginTop: 4 }}>{review.reviews}</Text>
                            </View>
                        </View>
                    )
                })}
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView
                ref={(ref) => setScrollViewRef(ref)}
            >
                {renderKitchenInfo()}
                {renderLocation()}
                {renderYouTubeReview()}
                {renderReviesAndRatings()}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 10,
    }
})

export default KitchenDetails;