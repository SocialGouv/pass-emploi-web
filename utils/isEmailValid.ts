export default function isEmailValid(email: string) {
  const mailRegExp =
    /[-A-Za-z0-9~!$%^&_=+}{'?]+(\.[-A-Za-z0-9~!$%^&_=+}{'?]+)*@[A-Za-z0-9_][-A-za-z0-9_]+(\.[A-Za-z]{2,6}){1,2}/
  return mailRegExp.test(email)
}
