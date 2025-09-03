import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {useState} from "react";
import {useRoute} from "@react-navigation/core";
import styles from "@/assets/styles/create.styles";
import {Ionicons} from "@expo/vector-icons";
import COLORS from "@/constants/colors";

import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"

export default function Create() {

    const [title, setTitle] = useState("")
    const [caption, setCaption] = useState("")
    const [rating, setRating] = useState(3)
    const [image, setImage] = useState(null)
    const [imageBase64, setimageBase64] = useState(null)
    const [loading, setIsLoading] = useState(false)

    const router = useRoute()

    const pickImage = async () => {
        try {
            if(Platform.OS !== "web") {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
                if(status !== "granted") {
                    Alert.alert("Permission Denied", "We need camera roll permissions to upload an image")
                    return
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true
            })

            if(!result.canceled) {
                setImage(result.assets[0].uri)

                if(result.assets[0].base64) {
                    setimageBase64(result.assets[0].base64)
                } else {
                    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                        encoding: FileSystem.EncodingType.Base64
                    })
                    setimageBase64(base64)
                }
            }
        } catch (err) {
            console.error("Error picking image: ", err)
            Alert.alert("Error", "There as a problem selecting your image")
        }
    }

    const handleSubmit = () => {

    }

    const renderRatingPicker = () => {
        const stars = []
        for(let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i} onPress={() => setRating(i)} style={styles.starButton}
                >
                    <Ionicons
                        name={i <= rating ? "star": "star-outline"}
                        size={32}
                        color={i <= rating ? "#f4b400" : COLORS.textSecondary}
                    />
                </TouchableOpacity>
            )
        }
        return <View style={styles.ratingContainer}>{stars}</View>
    }

    return (
       <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
       >
           <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
               <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Book Recommendation</Text>
                        <Text style={styles.subtitle}>Share your favorite reads with others</Text>
                    </View>

                   <View style={styles.form}>
                       <View style={styles.formGroup}>
                           <Text style={styles.label}>Book Title</Text>
                           <View style={styles.inputContainer}>
                               <Ionicons
                                   name="book-outline"
                                   size={20}
                                   color={COLORS.textSecondary}
                                   style={styles.inputIcon}
                               />
                               <TextInput
                                style={styles.input}
                                placeholder="Enter boot title"
                                placeholderTextColor={COLORS.placeholderText}
                                value={title}
                                onChangeText={setTitle}
                               />
                           </View>
                       </View>

                       <View style={styles.formGroup}>
                           <Text style={styles.label}>Your Rating</Text>
                           {renderRatingPicker()}
                       </View>

                       <View style={styles.formGroup}>
                           <Text style={styles.label}>Book Image</Text>
                           <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage()}>
                               {
                                   image
                                       ? (
                                           <Image source={{ uri: image }} style={styles.previewImage}/>
                                       )
                                       : (
                                           <View style={styles.placeholderContainer}>
                                                <Ionicons name="image-outline" size={40} color={COLORS.textSecondary}/>
                                                <Text style={styles.placeholderText}>Tap to select an image</Text>
                                           </View>
                                       )
                               }
                           </TouchableOpacity>
                       </View>

                       <View style={styles.formGroup}>
                           <Text style={styles.label}>Caption</Text>
                           <TextInput
                                style={styles.textArea}
                                placeholder="Write your review or thoughts about this book..."
                                placeholderTextColor={COLORS.placeholderText}
                                value={caption}
                                onChangeText={setCaption}
                                multiline
                           />
                       </View>
                   </View>
               </View>
           </ScrollView>
       </KeyboardAvoidingView>
    )
}