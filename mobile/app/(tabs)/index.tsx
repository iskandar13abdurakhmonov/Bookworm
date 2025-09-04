import {ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View} from "react-native";
import { Image } from "expo-image"
import {useAuthStore} from "@/store/authStore";
import {useEffect, useState} from "react";
import styles from "@/assets/styles/home.styles";
import {API_URL} from "@/constants/api";
import { Ionicons} from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import {formatPublishDate} from "@/lib/utils";
import Loader from "@/components/Loader";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {

    const { token, logout } = useAuthStore()

    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchBooks = async (pageNum = 1, refresh = false) => {
        try {
            if(refresh) {
                setRefreshing(true)
                setBooks([])
            } else if(pageNum === 1) {
                setLoading(true)
            }

            const response = await fetch(`${API_URL}/api/books?page=${pageNum}&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if(!response.ok) {
                throw new Error(data.message || "Failed to fetch books")
            }

            if(refresh) {
                setBooks(data.books)
            } else {

                const uniqueBooks =
                    refresh || pageNum === 1
                        ? data.books
                        : Array.from(new Set([...books, ...data.books].map((book) => book._id))).map((id) =>
                            [...books, ...data.books].find((book) => book._id === id)
                        )

                setBooks(uniqueBooks)
            }

            setHasMore(pageNum < data.totalPages)
            setPage(pageNum)
        } catch(err) {
            console.log("Error fetching books", err)
            if (err.message.includes('401') || err.message.includes('unauthorized')) {
                logout()
            }
        } finally {
            if(refresh) {
                await sleep(800)
                setRefreshing(false)
            }
            else setLoading(false)
        }
    }

    useEffect(() => {
        fetchBooks()
    }, []);

    const handleLoadMore = async () => {
        if (!loading && hasMore && !refreshing) {
            await fetchBooks(page + 1)
        }
    }

    const handleRefresh = async () => {
        await fetchBooks(1, true)
    }

    const renderRatingStars = (rating: any) => {
        const stars = []
        for(let i = 1; i <=5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={16}
                    color={i <= rating ? '#f4b400': COLORS.textSecondary}
                    style={{ marginRight: 2 }}
                />
            )
        }
        return stars
    }

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.bookCard}>
            <View style={styles.bookHeader}>
                <View style={styles.userInfo}>
                    <Image source={{ uri: item.user.profileImage }} style={styles.avatar}/>
                    <Text style={styles.username}>{item.user.username}</Text>
                </View>
            </View>

            <View style={styles.bookImageContainer}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.bookImage}
                    contentFit="cover"
                />
            </View>

            <View style={styles.bookDetails}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <View style={styles.ratingContainer}>
                    {renderRatingStars(item.rating)}
                </View>
                <Text style={styles.caption}>{item.caption}</Text>
                <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
            </View>
        </View>
    )

    if(loading) return <Loader/>

    return (
        <View style={styles.container}>
            <FlatList
                data={books}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListFooterComponent={loading && !refreshing ? <Text>Loading more...</Text> : null}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>BookWorm 🐛</Text>
                        <Text style={styles.headerSubtitle}>Discover great reads from the cummunity 👇</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="book-outline" size={60} color={COLORS.textSecondary}/>
                        <Text style={styles.emptyText}>No recommendations yet</Text>
                        <Text style={styles.emptySubtext}>Be the first to share a book!</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchBooks(1, true)}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            />
        </View>
    )
}