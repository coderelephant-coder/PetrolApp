import { View, Text, TouchableOpacity, Linking } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

const ContactButtons = () => {
  const phoneNumber = "07032429235";
  const emailAddress = "petapp4all@gmail.com";

  const handleWhatsApp = () => {
    const url = `https://wa.me/234${phoneNumber.slice(1)}`;
    Linking.openURL(url).catch(() => alert("Failed to open WhatsApp"));
  };

  const handleCall = () => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => alert("Failed to make a call"));
  };

  const handleEmail = () => {
    const url = `mailto:${emailAddress}`;
    Linking.openURL(url).catch(() => alert("Failed to open email client"));
  };
  return (
    <View>
      {/* WhatsApp Contact */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 12,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={handleWhatsApp}
      >
        <FontAwesome name="whatsapp" size={30} color="#25D366" />
        <Text style={{ fontSize: 18, marginLeft: 15, flex: 1 }}>
          WhatsApp us
        </Text>
        <MaterialIcons name="open-in-new" size={24} color="gray" />
      </TouchableOpacity>

      {/* Call Contact */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 12,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={handleCall}
      >
        <FontAwesome name="phone" size={30} color="gray" />
        <Text style={{ fontSize: 18, marginLeft: 15, flex: 1 }}>Call us</Text>
        <MaterialIcons name="open-in-new" size={24} color="gray" />
      </TouchableOpacity>
      {/* Email Contact */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 12,
          marginBottom: 40,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={handleEmail}
      >
        <FontAwesome name="envelope" size={28} color="#EA4335" />
        <Text className="text-lg flex-1 ml-4">Email us</Text>
        <MaterialIcons name="open-in-new" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default ContactButtons;
