// Stull formula (T is in Celcius, RH is a percent)
export default (T, RH) =>
  T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
 Math.atan(T + RH) - Math.atan(RH - 1.676331) +
 0.00391838 * (RH ** 1.5) * Math.atan(0.023101 * RH) -
 4.686035
