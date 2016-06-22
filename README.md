# MUNI Alexa Skill

Add incoming MUNI predictions to Amazon Echo's Alexa using this small skill. It's not published in the skills directory but you can deploy it with your own settings using AWS Lambda function and let it run for free.

Currently the skill only supports one stop and you need to hardcode the SFMTA stop number in `index.js`. Look up the nearest stop around your place using [511](http://transit.511.org/schedules/realtimedepartures.aspx).

## Adding a new developer skill

To get started, add a new Alexa Skill Set in [Amazon Developer Console](https://developer.amazon.com/edw/home.html#/). Once you created a new app, give it the following settings:

_**Skill Information**_

- Application Id - _Copy this to `index.js`_
- Skill type: Custom Interaction Model
- Name: _Name of your choosing, e.g. "Arriving Muni"_
- Invocation Name: _Command that your Alexa listens, e.g. "arriving muni"_

_**Interaction model**_

For _Intent Scema_, set:

```json
{
  "intents": [
    {
      "intent": "GetNextMuni"
    }
  ]
}
```

As this script is only invoced using the invocation name, no _Sample Utterances_ is really needed, but as the form requires a value:

```
GetNextMuni lol
```

_**Configuration**_

It's dead simple to deploy Alexa skills using AWS Lambda, so for _Endpoint_ select _Lambda ARN (Amazon Resource Name)_. Now, construct your Lambda function with `node_modules` directory.  This is required as Lambda is unable to pull NPM modules and they need to be bundled with the code. Please note that at this point you should have set `applicationId` and `muniStop` variables in the `index.js`:

```bash
git clone https://github.com/jorilallo/muni-alexa-skill.git
cd muni-alexa-skill

npm install
zip -r lambda_function.zip *
```

After this you'll need to deploy `lambda_function.zip` as a Lambda function:

1. [Login to AWS Console and visit Lambda settings](https://console.aws.amazon.com/lambda/home?region=us-east-1#)
1. Select _Create Lambda Function_
1. Skip blueprint selection
2. Set function name, e.g. `nextMuni` and select Node.js runtime
3. Upload as a Zip file (`lambda_function.zip`) to Lambda function
4. Use `index.handler` handler and select _Basic Execution Role_ for Role
5. Create Lambda function. Click the "Event Sources" tab and select "Alexa Skills Kit"
6. Finally, copy ARN from top right corner to your custom Alexa skill settings.

Once you have completed these steps, and pointed Alexa skill to the Lambda function, you should be able to test your skill with your _"Alexa, ask arriving muni"_. While this isn't really natural, the list of [invocation words](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/supported-phrases-to-begin-a-conversation) is still somewhat limited.
