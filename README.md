# Stamp-appscripts

https://stampit.js.org exposed via appsscripts library. Possibly a more accessible way to build composable objects for the citizen developer. If the world of prototypes and classes throws you, but you still want to build things in AppsScripts like you can build things with Lego, this may be for you.

# Getting Started

- Add library with ID `11jddOoTo-Y5LBxIUEvheHiLBxMuuDjbS-DXLoV330xiEKfmCNMzb3591`
- Default identifier is `Stamp`
- Use [documentation](https://stampit.js.org) to understand how to use
- Use it.

The below code is equivalent to the getting started example in the documentation:

```js
function myFunction () {
  const Point = Stamp.it({
    props: { // define the properties a Point has
      x: 0,
      y: 0
    },
    init({ x=0, y=0 }) { // do any setup stuff
      this.x = x;
      this.y = y;
    },
    methods: { // that goes to the prototype
      distance(point) {
        return Math.sqrt(Math.abs(this.x - point.x)**2 + Math.abs(this.y - point.y)**2);
      }
    }
  });
  
  // make an instance
  const point = Point();
  
  // display the instance
  Logger.log(point);  // {x: 0.0, y: 0.0}
}
```

# Highlights

Pros:

- Define "things" (stamps) that have particular properties and methods
- Structure code
- Don't have to learn about prototypes and classes (unless you want to)

Cons:

- The existing documentation assumes some knowledge of prototypes
- Have to understand that this library is called `Stamp` and the default method the npm module calls `stampit` here is `Stamp.it`. It's weird but necessary

# API

The main entry point will probably be `Stamp.it`, but the full set of methods are exposed via the following

Legend:
- `This library's namespace` = `npm library's namespace`

Equivalents:
- `Stamp.it` = `stampit`
- `Stamp.init` = `stampit.init`
- `Stamp.methods` = `stampit.methods`
- `Stamp.conf` = `stampit.conf`
- `Stamp.statics` = `stampit.statics`
- `Stamp.compose` = `stampit.compose`

# Alternative installation

Instead of adding it as a library, you can manually add it to your project and run via the online editor.

This library is really just a "wrapper" library for an existing npm module, just one that I find really interesting. If you prefer, you can copy the `Bundle.js` file and copy it into your project, and then use it like this:

```js
function myFunction () {
    // sorta like importing:
    const {stampit} = Import;   // <-

    // use it the same way the npm module documents
    const Point = stampit({...});
    const Another = stampit.init(function () {...});
}
```
