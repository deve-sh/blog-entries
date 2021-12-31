# The most common issue you'll run into with React! State Closures.

![Photo by Tim Gouw from Pexels](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fthe_most_common_issue_youll_run_into_with_javascript%2Fprimaryimage.jpg?alt=media&token=7c87523d-2bb3-4ab4-b488-95c1c9c33fa1)

**Note:** This post requires some advanced knowledge of JavaScript and React concepts. This post is fairly short in a series of posts I will write regarding certain gotchas and a lot of tutorials for stuff I find interesting and useful.

A senior JavaScript developer was interviewing a Junior JavaScript developer, the question was about [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures).

Too bad the interviewer hadn't checked the question, and both ended up assuming JavaScript works in a certain way and both got the answer wrong.

This is not a story, this happened in an interview I was present in.

Closures (Not going to explain too much about what they are, MDN Link above does a great job at it) are a god-send when you use them to your advantage, but oftentimes they are a pain when they unintentionally make their way into your code.

Take a look at the React component for example, do you notice a problem?

```javascript
const Component = props => {
    const [stateVariable, setStateVariable] = useState(0);

    useEffect(() => {
        window.setInterval(() => {
             console.log(stateVariable);
             setStateVariable(stateVariable + 1);
        }, 1000);
    }, []);

    return <>{stateVariable}</>
};
```
If you execute the above code as a component, what do you think will be the output?

![Closure Problem](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fsecondaryimages%2Fclosureproblem1628321438500.png?alt=media&token=407f8927-99bd-4ed6-8425-5549291265db)

If you notice, the `useEffect` block runs, but the value of `stateVariable` inside the useEffect function, is always 0, no matter what.

That's because the value of `stateVariable` is **closed** inside the scope of the useEffect callback function, the time the `window.setInterval` function started executing, the value of stateVariable was 0, and so for every execution of `setInterval`, the value it will have is 0.

There are workarounds to this issue:
- Put the `setInterval` outside in a scope that isn't closed.
- Use a value of `stateVariable` that isn't closed, i.e: 
```javascript
setStateVariable(value => value + 1);    // React will keep track of updated 'value'.
```
- Use a React `ref` variable or a `window.{global_variable}` since their values are guaranteed to be updated since they are not closed inside the scope of a function.

Now, by no means are closures bad they are ***necessary*** for a lot of tasks in JavaScript that we might want to perform, for example, event listeners require some level of closure to function sanely.

> An experienced developer might write off the above example as ignorance or naivety while working with the language, but I'm sure this would have puzzled them too while they might have been starting.

This is one of the quirks of the language, and it is not specific to JavaScript, as I said above, closures are an important concept, it would be chaos without them because we utilize them at places we don't even realize while programming. Python, Java, C++ are all languages that have some form of Closures.

Just watch out for these gotchas, I've personally wasted a lot of hours debugging code while starting.

Would love to read your thoughts on this.