import test from 'node:test'
import assert from 'node:assert/strict'
import {
  handlePhoneChange,
  handlePostalCodeChange,
  isValidBankAccount,
  isValidCNIC,
  isValidPakPhone,
  isValidPakPostalCode,
  validateField
} from './validation.js'

test('Pakistani phone validation supports 03/92/+92 formats', () => {
  assert.equal(isValidPakPhone('03001234567'), true)
  assert.equal(isValidPakPhone('923001234567'), true)
  assert.equal(isValidPakPhone('+923001234567'), true)
  assert.equal(isValidPakPhone('0312345678'), false)
  assert.equal(isValidPakPhone('0300abc4567'), false)
})

test('handlePhoneChange strips non-digits and limits to 11 digits', () => {
  let out = null
  handlePhoneChange('03-00 123 4567', (v) => { out = v })
  assert.equal(out, '03001234567')

  out = null
  handlePhoneChange('0300123456789', (v) => { out = v })
  assert.equal(out, '03001234567')
})

test('Pakistani postal code must be exactly 5 digits', () => {
  assert.equal(isValidPakPostalCode('54000'), true)
  assert.equal(isValidPakPostalCode('5400'), false)
  assert.equal(isValidPakPostalCode('54A00'), false)
})

test('handlePostalCodeChange strips non-digits and limits to 5 digits', () => {
  let out = null
  handlePostalCodeChange('54a 0009', (v) => { out = v })
  assert.equal(out, '54000')
})

test('CNIC validation uses 5-7-1 format with hyphens', () => {
  assert.equal(isValidCNIC('12345-1234567-1'), true)
  assert.equal(isValidCNIC('1234512345671'), false)
  assert.equal(isValidCNIC('12345-1234567-12'), false)
})

test('Bank account validation accepts 10-20 digits or PK IBAN', () => {
  assert.equal(isValidBankAccount('1234567890'), true)
  assert.equal(isValidBankAccount('12345678901234567890'), true)
  assert.equal(isValidBankAccount('123456789'), false)

  assert.equal(isValidBankAccount('PK36SCBL0000001123456702'), true)
  assert.equal(isValidBankAccount('pk36 scbl 0000001123456702'), true)
  assert.equal(isValidBankAccount('PK36SCBL000000112345670'), false)
})

test('validateField maps Pakistan-specific fields correctly', () => {
  assert.equal(validateField('zipCode', '54000'), null)
  assert.equal(validateField('zipCode', '54A00'), 'Must be 5 digits')

  assert.equal(validateField('phoneNumber', '03001234567'), null)
  assert.equal(validateField('phoneNumber', '0300123'), 'Use 03XXXXXXXXX or +92XXXXXXXXXX')

  assert.equal(validateField('cnicNumber', '12345-1234567-1'), null)
  assert.equal(validateField('cnicNumber', '1234512345671'), 'Format: 12345-1234567-1')
})

