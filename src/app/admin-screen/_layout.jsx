import { Stack } from "expo-router";

const sharedOptions = {
  headerTitleAlign: "center",
  headerTitleStyle: {
    fontSize: 25,
    fontWeight: "bold",
  },
};

const screens = [
  { name: "user-details", title: "Edit User Details" },
  { name: "station", title: "Stations" },
  { name: "vendor", title: "Vendor" },
  { name: "SingleVendor", title: "Vendor Details" },
  { name: "SingleStation", title: "Station Details" },
  { name: "orders", title: "Orders" },
  { name: "price", title: "Price" },
];

export default function Layout() {
  return (
    <Stack>
      {screens.map(({ name, title }) => (
        <Stack.Screen
          key={name}
          name={name}
          options={{
            title,
            ...sharedOptions,
          }}
        />
      ))}
    </Stack>
  );
}
