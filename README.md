# igus/teams-adaptive-card-action

A simple and lightning-fast GitHub action to send notifications as adaptive cards
to an MS Teams webhook.

It does not add any custom design. That's all up to you.

Actions and sections are defined as YAML following the
[Adaptive Cards schema](https://adaptivecards.io/explorer/) (see [Options](#options)).

## Usage

Add `igus/teams-adaptive-card-action@v1` to your workflow.

### Simple Example

```yml
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 📣 Send teams notification
        uses: igus/teams-adaptive-card-action@latest
        with:
          webhook: ${{ secrets.TEAMS_WEBHOOK }}
          message: Hello world!
```

…will produce an adaptive card like this:

![simple example output](./example-simple.png)

### Advanced Example

```yml
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 📣 Send teams notification
        uses: igus/teams-adaptive-card-action@latest
        with:
          webhook: ${{ secrets.TEAMS_WEBHOOK }}
          title: Hello world!
          message: <p>This is my <strong>awesome message!</strong></p>
          style: good
          actions: |
            - type: Action.OpenUrl
              title: Click here!
              url: https://whatever.com/foo/
            - type: Action.OpenUrl
              title: Or here…
              url: https://somewhere.com/bar/
```

…will produce an adaptive card like this:

![advanced example output](./example-advanced.png)

### Sections Example

```yml
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 📣 Send teams notification
        uses: igus/teams-adaptive-card-action@latest
        with:
          webhook: ${{ secrets.TEAMS_WEBHOOK }}
          title: Hello world!
          message: <p>This is my <strong>awesome message!</strong></p>
          style: attention
          actions: |
            - type: Action.OpenUrl
              title: Click here!
              url: https://whatever.com/foo/
            - type: Action.OpenUrl
              title: Or here…
              url: https://somewhere.com/bar/
          sections: |
            - type: Container
              items:
                - type: TextBlock
                  text: David Claux
                  weight: Bolder
                - type: TextBlock
                  text: 9/13/2016, 3:34pm
                  isSubtle: true
                - type: Image
                  url: https://connectorsdemo.azurewebsites.net/images/MSC12_Oscar_002.jpg
                - type: FactSet
                  facts:
                    - title: "Board:"
                      value: Name of board
                    - title: "List:"
                      value: Name of list
                    - title: "Assigned to:"
                      value: (none)
                    - title: "Due date:"
                      value: (none)
                - type: TextBlock
                  text: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  wrap: true
```

…will produce an adaptive card like this:

![advanced example output](./example-sections.png)

## Options

| Option     | Required | Default | Description                                                                                                                                                                                                                                        |
| ---------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `webhook`  | yes      | `''`    | The MS Teams webhook URL to send the notification to. Obviously required.                                                                                                                                                                          |
| `message`  | yes      | `''`    | The message content. Supports Markdown. Can also be empty.                                                                                                                                                                                         |
| `title`    | no       | `''`    | The title of your card. Will be omitted if left empty.                                                                                                                                                                                             |
| `style`    | no       | `''`    | Container style. Accepts: `default`, `emphasis`, `good`, `attention`, `warning`, `accent`. Falls back to `default` if empty or unrecognized.                                                                                                       |
| `actions`  | no       | `''`    | A YAML array of [`Action.OpenUrl`](https://adaptivecards.io/explorer/Action.OpenUrl.html) objects. Each item requires `type: Action.OpenUrl`, a `title` (button label), and a `url`. Invalid or unsupported items are logged and skipped.          |
| `sections` | no       | `''`    | A YAML array of [`Container`](https://adaptivecards.io/explorer/Container.html) objects. Each item requires `type: Container` and an `items` array of card elements (`TextBlock`, `Image`, `FactSet`, etc.). Invalid items are logged and skipped. |
