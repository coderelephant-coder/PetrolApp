import { View, Text, Linking } from "react-native";
import ContactButtons from "../../components/ContactButtons";

const Contact = () => {
  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-lg font-semibold mb-2">How can we help?</Text>
      <Text className="text-gray-500 mb-5">
        We’re here to help, reach us through any of the following contacts.
        Thank you.
      </Text>

      <ContactButtons />
    </View>
  );
};

export default Contact;
