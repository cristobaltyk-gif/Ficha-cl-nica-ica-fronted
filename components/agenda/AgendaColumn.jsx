<Slot
  key={`${professionalId}-${time}`}
  time={time}
  status={status}
  onSelect={(selectedTime) => {
    if (typeof onSelectSlot === "function") {
      onSelectSlot({
        professional: professionalId,
        time: selectedTime,
        status,
        slot
      });
    }
  }}
/>
