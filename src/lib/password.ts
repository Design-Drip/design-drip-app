import bcrypt from "bcrypt";

export class Password {
  static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(
    enteredPassword: string,
    hashedPassword: string
  ) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
}
