import test from 'ava'
import pressed from '../src/pressed.js'

let vowels = [65, 69, 73, 79, 85]
let emitter = { addEventListener: () => {}, removeEventListener: () => {} }

test('pressed.isListening(), pressed.start() and pressed.stop()', (assert) => {
  assert.truthy(pressed.isListening instanceof Function, 'pressed.isListening() is a function')
  assert.is(pressed.isListening(), false, 'pressed.isListening() is false by default')

  assert.truthy(pressed.start instanceof Function, 'start() is a function')
  assert.throws(() => pressed.start(), Error, 'Should throw if not run in an environment with a window object.')
  assert.notThrows(() => pressed.start(emitter), 'Shouldn\'t throw if a valid window object is provided.')
  assert.is(pressed.isListening(), true, 'isListening() will return true if running.')

  assert.truthy(pressed.stop instanceof Function, 'stop() is a function')
  // assert.notThrows(() => pressed.stop(), 'Unlike start(), will not throw if not run in an environment with a window object.')
  assert.is(pressed.isListening(), true, 'However, isListening() won\'t be set to false.')
  assert.notThrows(() => pressed.stop(emitter), 'Shouldn\'t throw if a valid window object is provided.')
  assert.is(pressed.isListening(), false, 'isListening() will be set to false.')
})

test('pressed()', (assert) => {
  assert.truthy(pressed instanceof Function, 'pressed() is a function')
  assert.throws(() => pressed(), Error, 'pressed() throws an error if start() hasn\'t been called')

  pressed.start(emitter)
  assert.is(pressed(65), false, 'By default, nothing down.')
  pressed.list[65] = true // A
  assert.is(pressed(65), true, 'When key is down, it returns true')
  assert.is(pressed('a'), true, 'Use strings or keycodes!')
  pressed.reset()
  assert.is(pressed(65), false, 'Keys removed properly.')

  pressed.list[49] = true // 1
  assert.is(pressed(49), true, 'Keycode for number works.')
  assert.is(pressed(1), false, 'Beware! Digits 0-9 are treated as keycodes.')
  assert.is(pressed('1'), true, 'Wrapping digits 0-9 in quotes solves the issue.')
  pressed.reset()

  pressed.list[91] = true // cmd or windows
  assert.is(pressed(91), true, 'Keycode for modifier key works.')
  assert.is(pressed(93), false, 'Keycode for right modifier key doesn\'t work.')
  assert.is(pressed('cmd'), true, 'String representation of modifier keys works.')
  assert.is(pressed('⌘'), true, 'Symbol representation of modifier keys works.')
  assert.is(pressed('right command'), false, 'Right command does not register left command key.')
  pressed.reset()

  pressed.list[93] = true // right cmd or windows
  assert.is(pressed('⌘'), true, 'String representation of modifier keys work for both left and right keys.')
  assert.is(pressed('cmd'), true, 'String representation of modifier keys work for both left and right keys.')
  assert.is(pressed('left command'), false, 'Except left command which doesn\'t register right command key.')
  assert.is(pressed('right command'), true, 'Right command does register right command key.')

  assert.throws(() => pressed({}), Error, 'pressed() throws an error if parameter isn\'t a string or number.')
  assert.throws(() => pressed('BOGUS KEY'), Error, 'Bogus key name throws.')
  assert.notThrows(() => pressed(99999), 'Bogus key code doesn\'t throw because it\'s hard to tell what\'s bogus!')

  pressed.stop(emitter)
})

test('pressed.key()', (assert) => {
  assert.truthy(pressed.key instanceof Function, 'pressed.key() is a more explicit alias for pressed()')
  pressed.start(emitter)
  pressed.list[65] = true // A
  assert.is(pressed.key(65), true, 'When key is down, it returns true')
  assert.is(pressed.key('A'), true, 'Works with strings')
  pressed.stop(emitter)
})

test('Mouse Buttons', (assert) => {
  assert.truthy(pressed.mouseButton instanceof Function, 'pressed.mouseButton() is a more explicit alias for pressed()')
  pressed.start(emitter)
  pressed.add(0) // Mouse butotn 0
  assert.is(pressed.list[0], true, 'Add adds mouse buttons to list correctly')
  assert.throws(() => { pressed.key(0) }, Error, 'Key() should not work with mouse buttons')
  assert.is(pressed(0), true, 'Pressed should work with mouse buttons')
  assert.is(pressed('mouse 0'), true, '"Mouse 0" is the string for mouse 0')
  assert.is(pressed.mouseButton(0), true, 'mouseButton() function works correctly')
  assert.throws(() => { pressed.mouseButton('mouse 0') }, Error, 'mouseButton() just works with ints')
  pressed.add(2)
  assert.is(pressed.some(0, 1, 2, 3), true, 'some() works as expected with mouse buttns')
  assert.is(pressed.every('mouse 0', 'mouse 2'), true, 'every() works as expected with mouse buttns')
  pressed.remove(0)
  assert.is(pressed(0), false, 'Remove works properly for mouse buttons')
  assert.is(pressed.every('mouse 0', 'mouse 2'), false, 'every() works as expected with mouse buttns')
  pressed.remove(2)
  pressed.add(5) // Bogus mouse button
  assert.throws(() => { pressed('mouse 5') }, Error, 'Mouse buttons 0-4 are the only ones supported (pressed()).')
  assert.throws(() => { pressed.mouseButton(5) }, Error, 'Mouse buttons 0-4 are the only ones supported (mouseButton()).')
  pressed.add(65) // 'A'
  assert.throws(() => { pressed.mouseButton(65) }, Error, 'mouseButton() just works with mouse buttons, not keys')
  pressed.stop(emitter)
  pressed.reset()
})

test('pressed.reset()', (assert) => {
  assert.truthy(pressed.reset instanceof Function, 'pressed.reset() is a function.')

  pressed.start(emitter)
  // hack list
  pressed.list[65] = true
  assert.is(pressed(65), true, 'List is not empty.')
  pressed.reset()
  assert.is(pressed(65), false, 'pressed.reset() clears the list.')
  pressed.stop(emitter)
})

test('pressed.every()', (assert) => {
  assert.truthy(pressed.every instanceof Function, 'pressed.every() is a function')
  assert.throws(() => pressed.every(), Error, 'Throws an error if start() hasn\'t been called')

  pressed.start(emitter)
  // hack list
  vowels.map(key => { pressed.list[key] = true })
  assert.truthy(pressed.every(...vowels), 'pressed.every() is true when all values are down')
  delete pressed.list[65]
  assert.falsy(pressed.every(...vowels), 'pressed.every() is false if any values are not down')

  pressed.reset()
  pressed.list[91] = true // cmd or windows
  pressed.list[16] = true // shift
  assert.truthy(pressed.every('shift', 'cmd'), 'pressed.every() works with modifier keys')

  pressed.stop(emitter)
})

test('pressed.listAllKeyCodes()', (assert) => {
  assert.truthy(pressed.listAllKeyCodes instanceof Function, 'pressed.listAllKeyCodes() is a function')

  pressed.start(emitter)
  // hack list
  vowels.map(key => { pressed.list[key] = true })
  assert.deepEqual(pressed.listAllKeyCodes(), vowels, 'listAllKeyCodes() returns an array of all key codes down')
  delete pressed.list[65]
  assert.deepEqual(pressed.listAllKeyCodes(), vowels.slice(1), 'listAllKeyCodes() returns an array of all key codes down')
  pressed.reset()
  assert.deepEqual(pressed.listAllKeyCodes(), [], 'listAllKeyCodes() returns an array of all key codes down')
  pressed.stop(emitter)
})

test('pressed.listAllKeys()', (assert) => {
  assert.truthy(pressed.listAllKeys instanceof Function, 'pressed.listAllKeys() is a function')

  pressed.start(emitter)
  // hack list
  vowels.map(key => { pressed.list[key] = true })
  assert.deepEqual(pressed.listAllKeys(), ['a', 'e', 'i', 'o', 'u'], 'listAllKeys() returns an array of all key strings down')
  delete pressed.list[65]
  assert.deepEqual(pressed.listAllKeys(), ['e', 'i', 'o', 'u'], 'listAllKeys() returns an array of all key strings down')
  pressed.reset()
  assert.deepEqual(pressed.listAllKeys(), [], 'listAllKeys() returns an array of all key strings down')
  pressed.list[91] = true
  assert.deepEqual(pressed.listAllKeys(), ['left command'], 'listAllKeys() returns the official version of keys with multiple strings based on `keycode()` package.')

  pressed.stop(emitter)
})

test('pressed.some()', (assert) => {
  assert.truthy(pressed.some instanceof Function, 'pressed.some() is a function')
  assert.throws(() => pressed.some(), Error, 'Throws an error if start() hasn\'t been called')

  pressed.start(emitter)
  // hack list
  pressed.list[65] = true
  assert.truthy(pressed.some(...vowels), 'pressed.some() is true when any of the keys are down')
  assert.falsy(pressed.some('f'), 'pressed.some() is false if none of the values are down. Works with strings')

  pressed.reset()
  pressed.list[91] = true // cmd or windows
  pressed.list[16] = true // shift
  assert.truthy(pressed.some('shift'), 'pressed.some() works with modifier keys')
  pressed.stop(emitter)
})

test('pressed.list', (assert) => {
  assert.truthy(pressed.list instanceof Object, 'pressed.list is an Object')
})

test('pressed.add() and pressed.remove()', (assert) => {
  assert.truthy(pressed.add instanceof Function, 'pressed.add() is a function for manually adding codes')
  assert.is(pressed.listAllKeyCodes().length, 0, 'Ensure list is empty.')
  pressed.add(65)
  assert.is(pressed.listAllKeyCodes()[0], 65, 'Added 65 manually')

  assert.truthy(pressed.remove instanceof Function, 'pressed.remove() is a function for manually removing codes')
  pressed.remove('a')
  assert.is(pressed.listAllKeyCodes().length, 0, 'Ensure list is empty. Strings work too.')

  pressed.add('A', 'B', 'C')
  assert.is(pressed.listAllKeyCodes().length, 3, 'Add mulitple keys with one call.')
  pressed.remove(65, 66, 67)
  assert.is(pressed.listAllKeyCodes().length, 0, 'Remove mulitple keys with one call')
})
