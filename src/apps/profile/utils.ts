function generateRestaurantId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let id = 'DH-';
  
  // Add 3 random characters
  for (let i = 0; i < 3; i++) {
    const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
    id += randomChar;
  }
  
  // Add 4 random numbers
  for (let i = 0; i < 4; i++) {
    const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
    id += randomNumber;
  }
  
  return id;
}

export { generateRestaurantId };