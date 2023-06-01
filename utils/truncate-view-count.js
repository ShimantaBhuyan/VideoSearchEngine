export const truncateViewCount = (views) => {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return views ? formatter.format(views) : 0;
};
