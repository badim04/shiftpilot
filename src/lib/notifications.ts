import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Ask permission, get the Expo push token, save it so the backend can reach this device. */
export async function registerForPush(userId: string) {
  if (Platform.OS === "web" || !Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Shift alerts",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await supabase.from("push_tokens").upsert({
    user_id: userId,
    expo_push_token: token,
    platform: Platform.OS,
    updated_at: new Date().toISOString(),
  });
}

/** Local reminder (fires even offline / airplane mode). */
export async function scheduleShiftReminder(opts: {
  shiftId: string;
  venue: string;
  company: string;
  startsAt: Date;
  offsetMins: number;
}) {
  if (Platform.OS === "web") return;
  const fireAt = new Date(opts.startsAt.getTime() - opts.offsetMins * 60_000);
  if (fireAt <= new Date()) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `reminder-${opts.shiftId}`,
    content: {
      title: "Upcoming shift",
      body: `${opts.venue} (${opts.company}) — ${opts.startsAt.toLocaleString("en-GB", {
        weekday: "short", hour: "2-digit", minute: "2-digit",
      })}`,
      sound: "default",
      data: { shiftId: opts.shiftId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
}

export async function cancelShiftReminder(shiftId: string) {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(`reminder-${shiftId}`);
}
