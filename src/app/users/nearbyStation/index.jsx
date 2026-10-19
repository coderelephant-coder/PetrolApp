import React, { useEffect, useState, useRef } from "react";
import { View, Alert } from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { getPetrolPrice } from "@/src/components/utils/station";
import StationList from "@/src/components/StationList";

const NearbyStation = () => {
  const [location, setLocation] = useState([0, 0]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationReady, setLocationReady] = useState(false);

  const prevCoordsRef = useRef([0, 0]);
  const locationSubscriptionRef = useRef(null);
  const fetchingStationsRef = useRef(false);

  const avatarColors = [
    "#007AFF",
    "#FF9500",
    "#34C759",
    "#AF52DE",
    "#FF3B30",
    "#5AC8FA",
    "#5856D6",
  ];

  const getAvatarColor = (name = "") => {
    const index = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
  };

  const mergeStationsWithPrices = (stationsList, pricesList) => {
    const priceMap = new Map();

    pricesList.forEach((priceItem) => {
      if (!priceItem?.stationName) return;

      const key = priceItem.stationName.trim().toLowerCase();
      priceMap.set(key, priceItem.priceAndType);
    });

    return stationsList.map((station) => {
      const key = station.name.trim().toLowerCase();

      return {
        ...station,
        priceAndType: priceMap.get(key) || [],
      };
    });
  };

  // Get a readable address from coordinates using the device geocoder.
  const getAddress = async (lng, lat) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        longitude: lng,
        latitude: lat,
      });

      const address = addresses?.[0];

      if (!address) {
        return "Unknown Location";
      }

      const parts = [
        address.name,
        address.street,
        address.district,
        address.city,
        address.region,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(", ") : "Unknown Location";
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return "Unknown Location";
    }
  };

  // Calculate distance in km between two coordinate points.
  const getDistance = ([lng, lat], [userLng, userLat]) => {
    const toRad = (deg) => deg * (Math.PI / 180);
    const R = 6371;

    const dLat = toRad(lat - userLat);
    const dLng = toRad(lng - userLng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const fetchStationsWithPrices = async ([lng, lat]) => {
    if (fetchingStationsRef.current) {
      return;
    }

    fetchingStationsRef.current = true;
    setLoading(true);

    const radius = 20000;

    const query = `
      [out:json];
      node["amenity"="fuel"](around:${radius},${lat},${lng});
      out;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      query
    )}`;

    try {
      const [priceResult, response] = await Promise.all([
        getPetrolPrice().catch((err) => {
          console.error("Petrol price error:", err);
          return [];
        }),
        axios.get(url, {
          timeout: 20000,
        }),
      ]);

      const priceData = Array.isArray(priceResult) ? priceResult : [];

      let stationList = response.data.elements.map((el) => {
        const tags = el.tags || {};

        const addressParts = [
          tags["addr:housenumber"],
          tags["addr:street"],
          tags["addr:suburb"],
          tags["addr:city"],
        ].filter(Boolean);

        return {
          id: el.id,
          coordinates: [el.lon, el.lat],
          name: tags.name || "Petrol Station",
          address:
            addressParts.length > 0
              ? addressParts.join(", ")
              : "Loading address...",
        };
      });

      // Sort stations by distance from the user.
      stationList.sort(
        (a, b) =>
          getDistance(a.coordinates, [lng, lat]) -
          getDistance(b.coordinates, [lng, lat])
      );

      const mergedStations = mergeStationsWithPrices(
        stationList,
        priceData
      );

      // Display stations immediately.
      setStations(mergedStations);
      setLoading(false);

      // Fill missing addresses in the background.
      const stationsWithAddresses = await Promise.all(
        mergedStations.map(async (station) => {
          if (station.address !== "Loading address...") {
            return station;
          }

          const address = await getAddress(
            station.coordinates[0],
            station.coordinates[1]
          );

          return {
            ...station,
            address,
          };
        })
      );

      setStations(stationsWithAddresses);
    } catch (err) {
      console.error("Error fetching nearby stations:", err);
      setLoading(false);

      Alert.alert(
        "Nearby Stations",
        "Unable to load nearby petrol stations. Please try again."
      );
    } finally {
      fetchingStationsRef.current = false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getDistanceInMeters = ([lng1, lat1], [lng2, lat2]) => {
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 6371000;

      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    };

    const handleLocationUpdate = async (coords, force = false) => {
      if (!coords || !isMounted) return;

      const { longitude, latitude } = coords;

      if (
        typeof longitude !== "number" ||
        typeof latitude !== "number"
      ) {
        return;
      }

      const newCoords = [longitude, latitude];
      const prevCoords = prevCoordsRef.current;

      const distance =
        prevCoords[0] === 0 && prevCoords[1] === 0
          ? Infinity
          : getDistanceInMeters(prevCoords, newCoords);

      // The first/current GPS position is always accepted.
      // The 50m threshold only applies to later updates.
      if (force || distance >= 50) {
        prevCoordsRef.current = newCoords;
        setLocation(newCoords);
        setLocationReady(true);

        await fetchStationsWithPrices(newCoords);
      }
    };

    const startLocationUpdates = async () => {
      try {
        const servicesEnabled =
          await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
          setLoading(false);

          Alert.alert(
            "Location Disabled",
            "Please turn on your device's GPS/location services and try again."
          );

          return;
        }

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLoading(false);

          Alert.alert(
            "Permission Denied",
            "Location permission is required to find nearby petrol stations."
          );

          return;
        }

        // Use the last known location first for a fast initial result.
        const lastKnown =
          await Location.getLastKnownPositionAsync({});

        if (lastKnown?.coords) {
          await handleLocationUpdate(lastKnown.coords, true);
        }

        // Always obtain the current location afterward.
        // This prevents a stale last-known location from becoming
        // the permanent location used by the screen.
        const current =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        if (current?.coords) {
          await handleLocationUpdate(current.coords, true);
        }

        // Continue tracking while the screen is open.
        locationSubscriptionRef.current =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              distanceInterval: 50,
              timeInterval: 5000,
            },
            (position) => {
              handleLocationUpdate(position.coords);
            },
            (reason) => {
              console.error(
                "Location watch error:",
                reason
              );
            }
          );
      } catch (err) {
        console.error("Location error:", err);

        if (isMounted) {
          setLoading(false);

          Alert.alert(
            "Location Error",
            "Unable to get your current location."
          );
        }
      }
    };

    startLocationUpdates();

    return () => {
      isMounted = false;

      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
    };
  }, []);

  // Keep the old 15-second initial-location timeout.
  useEffect(() => {
    if (locationReady) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      if (!locationReady) {
        setLoading(false);

        Alert.alert(
          "Location Unavailable",
          "Unable to obtain your location. Please make sure GPS/location services are enabled and try again."
        );
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [locationReady]);

  return (
    <View style={{ flex: 1 }}>
      <StationList
        loading={loading}
        stations={stations}
        location={location}
        getDistance={getDistance}
        getAvatarColor={getAvatarColor}
        onRefresh={async () => {
          try {
            setLoading(true);

            const servicesEnabled =
              await Location.hasServicesEnabledAsync();

            if (!servicesEnabled) {
              setLoading(false);

              Alert.alert(
                "Location Disabled",
                "Please turn on your device's GPS/location services and try again."
              );

              return;
            }

            const { status } =
              await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
              setLoading(false);

              Alert.alert(
                "Permission Denied",
                "Location permission is required."
              );

              return;
            }

            let loc =
              await Location.getLastKnownPositionAsync({});

            if (!loc?.coords) {
              loc =
                await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.High,
                });
            }

            if (!loc?.coords) {
              setLoading(false);

              Alert.alert(
                "Error",
                "Location not available. Try again."
              );

              return;
            }

            const {
              longitude,
              latitude,
            } = loc.coords;

            const newCoords = [longitude, latitude];

            prevCoordsRef.current = newCoords;
            setLocation(newCoords);
            setLocationReady(true);

            await fetchStationsWithPrices(newCoords);
          } catch (err) {
            console.error(
              "Refresh location error:",
              err
            );

            setLoading(false);

            Alert.alert(
              "Error",
              "Unable to get your current location."
            );
          }
        }}
      />
    </View>
  );
};

export default NearbyStation;