export function eventInputValue(instant: string) {
  return instant
    ? new Date(Date.parse(instant) + 330 * 60 * 1000).toISOString().slice(0, 19)
    : "";
}
export function eventInputToIso(value: string) {
  if (!value) return "";
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value))
    throw new Error("Choose a valid event date and time.");
  return (value.length === 16 ? value + ":00" : value) + "+05:30";
}
