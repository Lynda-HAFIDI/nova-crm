"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Task = {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
};

export default function TasksCalendar({ tasks }: { tasks: Task[] }) {
  const dueDates = tasks
    .filter((task) => task.due_date)
    .map((task) => new Date(task.due_date as string).toDateString());

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <Calendar
        tileClassName={({ date }) => {
          const day = date.toDateString();
          if (dueDates.includes(day)) {
            return "has-task-date";
          }
          return null;
        }}
      />
    </div>
  );
}