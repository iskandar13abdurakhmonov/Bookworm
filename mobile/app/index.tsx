import { Link } from "expo-router";
import {Text, TouchableOpacity, View} from "react-native";
import {useAuthStore} from "@/store/authStore";
import {useEffect} from "react";

export default function Index() {

    const { user, token, checkAuth, logout } = useAuthStore()

    console.log(user, token)

    useEffect(() => {
        checkAuth()
    }, []);

      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Hello {user?.username}</Text>
            <Text>Token: {token}</Text>

            <TouchableOpacity onPress={logout}>
                <Text>Logout</Text>
            </TouchableOpacity>

          <Link href="/(auth)">login</Link>
          <Link href="/(auth)/signup">signup</Link>
        </View>
      );
}
