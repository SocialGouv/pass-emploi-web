export default function isEmailValid(email: string) {
  // https://sonarcloud.io/organizations/socialgouv/rules?open=typescript%3AS5852&rule_key=typescript%3AS5852
  // https://www.regular-expressions.info/email.html
  const mailRegExp =
    /^[A-Z0-9._%+-]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i
  return mailRegExp.test(email)
}
