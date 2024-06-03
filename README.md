# discord js wrapper
cool little thing that can send and delete and edit messages using the developer console in discord (For now)

# usage

## creating a new user
```
  var user = new discord.User(optional_token, optional_url_configuration);
```

## obtaining user information
### user token
```
  user.token
```
### user id
```
  user.id
```

## message API

### sending a message
```
  user.message.send("foo", optional_id)
```
### editing a message
```
  user.message.edit("bar", optional_id)
```
### deleting a message
```
  user.message.delete(optional_id)
```
### reply to a message
```
  user.message.reply("foo", optional_id)
```
### react to a message
```
  user.message.react("emoji_only", optional_id)
```
### unreact to a message
```
  user.message.unreact("emoji_only", optional_id)
```

## fetch recent messages
### fetch most recent message sent by user
```
  await user.message.get_last_user_message()
```
### fetch most recent message in channel
```
  await user.message.get_last_message()
```

## libraries
### Base64
```
  discord.libraries.Base64.encode("foo")
```
```
  discord.libraries.Base64.decode("Zm9v")
```
### Binary
```
  discord.libraries.Binary.from_decimal(10, optional_min_bit_count)
```
```
  discord.libraries.Binary.to_decimal("1010")
```
```
  discord.libraries.Binary.get_bit_count(10)
```
```
  discord.libraries.Binary.from_string("foobar")
```

## extras
### run
```
  discord.run(discord_function_name)
```
  


