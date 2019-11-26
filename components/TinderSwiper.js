import React, { Component } from "react";
import { StyleSheet, Text, View, Dimensions, Image, Animated, PanResponder } from "react-native";
import { bindComponentToImageSource } from "../redux/itemReducer";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

class TinderSwiperUnbound extends Component {
    constructor() {
        super();
        this._initialize();
    }

    componentWillMount() {
        this._mountPanResponder();
    }

    _initialize() {
        this.position = new Animated.ValueXY();
        this.opacity = new Animated.Value(1);

        this.state = {
            currentIndex: 0
        };

        this.rotate = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: ['-30deg', '0deg', '10deg'],
            extrapolate: 'clamp'
        });

        this.rotateAndTranslate = {
            transform: [{
                rotate: this.rotate
            },
            ...this.position.getTranslateTransform()
            ]
        };

        this.likeOpacity = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp'
        });

        this.dislikeOpacity = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0, 0],
            extrapolate: 'clamp'
        });

        this.nextCardOpacity = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0, 1],
            extrapolate: 'clamp'
        });

        this.nextCardScale = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0.8, 1],
            extrapolate: 'clamp'
        });

        this.animatedStyles = {
            animatedViewFirst: [{ opacity: this.opacity }, this.rotateAndTranslate, styles.cardAnimatedView],
            animatedViewSecond: [
                {
                    opacity: this.nextCardOpacity,
                    transform: [{ scale: this.nextCardScale }],
                },
                styles.cardAnimatedView
            ],
            animatedBadgeLikeFirst: [styles.badgeViewLike, { opacity: this.likeOpacity }],
            animatedBadgeNopeFirst: [styles.badgeViewNope, { opacity: this.dislikeOpacity }],
            animatedBadgeNopeSecond: [],
            animatedBadgeLikeSecond: []
        };
    }

    _getCurrentItem() {
        return this.props.currentItem;
    }

    _mountPanResponder() {
        const { onLike, onNope } = this.props;
        const _getCurrentItem = this._getCurrentItem.bind(this);
        const me = this;

        this.PanResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,

            onPanResponderMove: (_, gestureState) => {
                this.position.setValue({ x: gestureState.dx, y: gestureState.dy })
            },

            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > 120) {
                    if (typeof onLike === "function")
                        onLike(_getCurrentItem());

                    me.opacity.setValue(0);
                    me.position.setValue({ x: 0, y: 0 });
                    me.setState({ currentIndex: me.state.currentIndex + 1 });
                }
                else if (gestureState.dx < -120) {
                    if (typeof onNope === "function")
                        onNope(_getCurrentItem());

                    me.opacity.setValue(0);
                    me.position.setValue({ x: 0, y: 0 });
                    me.setState({ currentIndex: me.state.currentIndex + 1 });
                }
                else {
                    Animated.spring(this.position, {
                        toValue: { x: 0, y: 0 },
                        friction: 4
                    }).start()
                }
            }
        })
    }

    _renderCards = () => {
        let nextImage = null, currentImage = null;
        if (this.props.currentItem) {
            let currentItem = this.props.currentItem.item;
            currentImage =
                <Animated.View {...this.PanResponder.panHandlers} style={this.animatedStyles.animatedViewFirst}>
                    <Animated.View style={this.animatedStyles.animatedBadgeLikeFirst}>
                        <Text style={styles.badgeLike}>LIKE</Text>
                    </Animated.View>

                    <Animated.View style={this.animatedStyles.animatedBadgeNopeFirst}>
                        <Text style={styles.badgeNope}>NOPE</Text>
                    </Animated.View>

                    <View style={styles.card}>
                        <View style={styles.cardImageView}>
                            <Image style={styles.cardImage} source={{ uri: this.props.currentItem.uri }} />
                        </View>
                        <View style={styles.info}>
                                <View style={styles.line1}>
                                    <Text style={styles.itemNumber}>{currentItem.number}</Text>
                                    <Text style={styles.itemName}>{currentItem.name}</Text>
                                </View>
                                <View style={styles.line2}>
                                    <Text style={styles.itemTheme}>Theme: {currentItem.theme}</Text>
                                </View>
                            </View>
                        <View style={styles.cardBody}></View>
                    </View>
                </Animated.View>;
        }

        if (this.props.nextItem) {
            let nextItem = this.props.nextItem.item;
            nextImage =
                <Animated.View style={this.animatedStyles.animatedViewSecond}>
                    <View style={styles.card}>
                        <View style={styles.cardImageView}>
                            <Image style={styles.cardImage} source={{ uri: this.props.nextItem.uri }} />
                        </View>
                        <View style={styles.info}>
                                <View style={styles.line1}>
                                    <Text style={styles.itemNumber}>{nextItem.number}</Text>
                                    <Text style={styles.itemName}>{nextItem.name}</Text>
                                </View>
                                <View style={styles.theme}>
                                    <Text style={styles.itemTheme}>Theme: {nextItem.theme}</Text>
                                </View>
                            </View>
                        <View style={styles.cardBody}></View>
                    </View>
                </Animated.View>;
        }

        return (
            <>
                {this.opacity.setValue(1), null}
                {nextImage}
                {currentImage}
            </>
        );
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ height: 80 }} />
                <View style={{ flex: 1 }}>
                    {this._renderCards()}
                </View>
                <View style={{ height: 80 }} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    card: {
        padding: 20,
        flex: 1,
        borderRadius: 20,
        backgroundColor: "white",
        flexDirection: "column"
    },
    cardAnimatedView: {
        height: SCREEN_HEIGHT - 120,
        width: SCREEN_WIDTH,
        padding: 30,
        position: 'absolute'
    },
    badgeViewLike: {
        borderRadius: 8,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#ffffff",
        transform: [{ rotate: '-30deg' }],
        position: 'absolute',
        top: 50,
        left: 40,
        zIndex: 1000,
        shadowOffset: { width: 10, height: 10, },
        shadowColor: 'black',
        shadowOpacity: 1.0,
    },
    badgeViewNope: {
        borderRadius: 8,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#ffffff",
        transform: [{ rotate: '30deg' }],
        position: 'absolute',
        top: 50,
        right: 40,
        zIndex: 1000,
        shadowOffset: { width: 10, height: 10, },
        shadowColor: 'black',
        shadowOpacity: 1.0,
    },
    badgeLike: {
        color: 'green',
        fontSize: 32,
        fontWeight: '800',
        padding: 10
    },
    badgeNope: {
        color: 'red',
        fontSize: 32,
        fontWeight: '800',
        padding: 10
    },
    cardImage: {
        flex: 1,
        height: null,
        width: null,
        resizeMode: 'cover',
        borderRadius: 20,
    },
    cardImageView: {
        flex: 0.5,
        borderWidth: 1,
        borderColor: "transparent",
        shadowOffset: { width: 0, height: 0, },
        shadowRadius: 5,
        shadowColor: 'black',
        shadowOpacity: 0.4,
    },
    cardBody: {
        flex: 0.5
    },
    info: {
        marginTop: 30,
        flexDirection: "column"
    },
    line1: {
        flexDirection: "column",
        marginBottom: 8
    },
    line2: {
    },
    itemName: {
        marginTop: 16,
        color: "#000000",
        fontWeight: "bold",
        fontSize: 28
    },
    itemNumber: {
        color: "#000000",
        fontSize: 14
    },
    itemTheme: {
        color: "#000000",
        fontSize: 16
    },
});

export const TinderSwiper = bindComponentToImageSource(TinderSwiperUnbound);