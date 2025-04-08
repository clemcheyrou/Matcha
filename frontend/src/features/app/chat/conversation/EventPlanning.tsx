import React, { useState } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import moment from "moment";
import socket from "../../../../service/socket";
import { useParams } from "react-router-dom";

export const EventPlanning = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>(""); // Nouvelle variable d'état pour l'heure
  const [setMessage] = useState<string>("");
  const { chatId } = useParams<{ chatId: string }>();

  const [currentMonth, setCurrentMonth] = useState(moment());

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const prevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, "month"));
  };

  const nextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, "month"));
  };

  const generateDays = () => {
    const startOfMonth = currentMonth.clone().startOf("month");
    const endOfMonth = currentMonth.clone().endOf("month");

    const days: (moment.Moment | null)[] = [];
    let currentDay = startOfMonth;

    while (currentDay.weekday() !== 0) {
      days.push(null);
      currentDay = currentDay.clone().subtract(1, "day");
    }

    while (currentDay.isBefore(endOfMonth, "day")) {
      days.push(currentDay.clone());
      currentDay = currentDay.clone().add(1, "day");
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  };

  const handleDateSelect = (date: moment.Moment | null) => {
    if (date) {
      setSelectedDate(date.toDate());
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(event.target.value);
  };

  const handleSubmit = async () => {
    if (selectedDate && selectedTime) {
      const eventData = {
        title: '',
        date: selectedDate.toISOString(),
        time: selectedTime,
        chat_id: Number(chatId),
      };

      socket.emit("create-event-and-invite", eventData);

      setMessage("Event successfully created and invitation sent.");
      toggleModal();
    }
  };

  const monthYear = currentMonth.format("MMMM YYYY");

  return (
    <div>
      <button
        onClick={toggleModal}
        className="flex items-center gap-2 p-2 bg-gray-200 text-gray-800 rounded-lg text-xs"
      >
        <AiOutlineCalendar size={16} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-bg p-4 pt-0 mb-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-4">Organize an Event</h2>

            <div className="mb-4">
              <label className="block text-sm mb-2">Select Date</label>
              <div className="text-center text-sm">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded mr-2 text-xs"
                >
                  {"<"}
                </button>
                <span className="text-lg">{monthYear}</span>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded ml-2"
                >
                  {">"}
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mt-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-semibold text-sm">
                    {day}
                  </div>
                ))}

                {generateDays().map((day, index) => (
                  <div
                    key={index}
                    className={`p-2 text-center ${
                      day && day.isSame(selectedDate, "day")
                        ? "bg-pink text-white rounded-lg"
                        : "cursor-pointer"
                    } ${day ? "hover:bg-gray-200 rounded-md" : ""}`}
                    onClick={() => day && handleDateSelect(day)}
                  >
                    {day ? day.date() : ""}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-2">Select Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full p-2 border rounded-lg text-black"
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={toggleModal}
                className="bg-gray-300 p-2 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-pink text-white p-2 rounded text-sm"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
