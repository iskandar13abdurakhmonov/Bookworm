import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello</Text>
      <Link href="/(auth)">login</Link>
      <Link href="/(auth)/signup">signup</Link>
    </View>
  );
}
