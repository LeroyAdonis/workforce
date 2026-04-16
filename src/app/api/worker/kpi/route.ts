import { NextRequest } from "next/server";
import { db } from "@/db";
import { visits, users } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, errors } from "@/lib/api/responses";

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
function startOfMonth(d: Date) {
  const copy = new Date(d);
  copy.setDate(1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
function endOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function calcStatus(actual: number, target: number): "green" | "amber" | "red" {
  if (actual >= target) return "green";
  const pace = target > 0 ? actual / target : 0;
  if (pace >= 0.7) return "amber";
  return "red";
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return errors.unauthorized();

    const userId = Number((session.user as { id: string }).id);
    const now = new Date();
    const hourOfDay = now.getHours();

    // Get user targets
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { targetVisitsDaily: true, targetKmsDaily: true },
    });

    const dailyTarget = user?.targetVisitsDaily ?? 12;
    const kmDailyTarget = parseFloat(user?.targetKmsDaily ?? "150");

    // Today
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const todayVisits = await db
      .select()
      .from(visits)
      .where(
        and(
          eq(visits.workerId, String(userId)),
          gte(visits.timestamp, todayStart),
          lt(visits.timestamp, todayEnd)
        )
      );

    const todaySites = todayVisits.length;
    const todayKm = todayVisits.reduce(
      (sum, v) => sum + parseFloat(String(v.kmsCovered ?? "0")),
      0
    );

    // This week
    const weekStart = startOfWeek(now);
    const weeklyVisits = await db
      .select()
      .from(visits)
      .where(
        and(
          eq(visits.workerId, String(userId)),
          gte(visits.timestamp, weekStart)
        )
      );

    const weeklySites = weeklyVisits.length;
    const weeklyKm = weeklyVisits.reduce(
      (sum, v) => sum + parseFloat(String(v.kmsCovered ?? "0")),
      0
    );

    // This month
    const monthStart = startOfMonth(now);
    const monthlyVisits = await db
      .select()
      .from(visits)
      .where(
        and(
          eq(visits.workerId, String(userId)),
          gte(visits.timestamp, monthStart)
        )
      );

    const monthlySites = monthlyVisits.length;
    const monthlyKm = monthlyVisits.reduce(
      (sum, v) => sum + parseFloat(String(v.kmsCovered ?? "0")),
      0
    );

    // Expected pace
    const expectedToday = dailyTarget * (hourOfDay / 24);
    const pacePercent = expectedToday > 0 ? (todaySites / expectedToday) * 100 : 0;

    // Days elapsed this week (0-6)
    const dayOfWeek = now.getDay();
    const expectedWeek = dailyTarget * (dayOfWeek + 1);
    const weeklyPacePercent = expectedWeek > 0 ? (weeklySites / expectedWeek) * 100 : 0;

    // Days elapsed this month
    const dayOfMonth = now.getDate() - 1;
    const expectedMonth = dailyTarget * (dayOfMonth + 1);
    const monthlyPacePercent = expectedMonth > 0 ? (monthlySites / expectedMonth) * 100 : 0;

    return successResponse({
        todaySites,
        todayKm: Math.round(todayKm * 10) / 10,
        todayTarget: dailyTarget,
        todayStatus: calcStatus(todaySites, expectedToday),
        weeklySites,
        weeklyKm: Math.round(weeklyKm * 10) / 10,
        weeklyTarget: dailyTarget * 7,
        weeklyStatus: calcStatus(weeklySites, expectedWeek),
        monthlySites,
        monthlyKm: Math.round(monthlyKm * 10) / 10,
        monthlyTarget: dailyTarget * 30,
        monthlyStatus: calcStatus(monthlySites, expectedMonth),
        pacePercent: Math.round(pacePercent),
        weeklyPacePercent: Math.round(weeklyPacePercent),
        monthlyPacePercent: Math.round(monthlyPacePercent),
    });
  } catch (error) {
    console.error("GET KPI error:", error);
    return errors.internal("Failed to fetch KPI");
  }
}