const equalFn = (a, b) => a === b;
const signalOptions = {
  equals: equalFn
};
let runEffects = runQueue;
const STALE = 1;
const PENDING = 2;
const UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var Owner = null;
let Transition = null;
let Listener = null;
let Updates = null;
let Effects = null;
let ExecCount = 0;
function createSignal(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || undefined
  };
  const setter = value => {
    if (typeof value === "function") {
      value = value(s.value);
    }
    return writeSignal(s, value);
  };
  return [readSignal.bind(s), setter];
}
function createEffect(fn, value, options) {
  runEffects = runUserEffects;
  const c = createComputation(fn, value, false, STALE),
    s = SuspenseContext && lookup(Owner, SuspenseContext.id);
  if (s) c.suspense = s;
  if (!options || !options.render) c.user = true;
  Effects ? Effects.push(c) : updateComputation(c);
}
function untrack(fn) {
  if (Listener === null) return fn();
  const listener = Listener;
  Listener = null;
  try {
    return fn();
  } finally {
    Listener = listener;
  }
}
function onCleanup(fn) {
  if (Owner === null) ;else if (Owner.cleanups === null) Owner.cleanups = [fn];else Owner.cleanups.push(fn);
  return fn;
}
let SuspenseContext;
function readSignal() {
  if (this.sources && (this.state)) {
    if ((this.state) === STALE) updateComputation(this);else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  return this.value;
}
function writeSignal(node, value, isComp) {
  let current = node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0; i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o)) ;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure) Updates.push(o);else Effects.push(o);
            if (o.observers) markDownstream(o);
          }
          if (!TransitionRunning) o.state = STALE;
        }
        if (Updates.length > 10e5) {
          Updates = [];
          if (false) ;
          throw new Error();
        }
      }, false);
    }
  }
  return value;
}
function updateComputation(node) {
  if (!node.fn) return;
  cleanNode(node);
  const owner = Owner,
    listener = Listener,
    time = ExecCount;
  Listener = Owner = node;
  runComputation(node, node.value, time);
  Listener = listener;
  Owner = owner;
}
function runComputation(node, value, time) {
  let nextValue;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError(err);
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue);
    } else node.value = nextValue;
    node.updatedAt = time;
  }
}
function createComputation(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state: state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: null,
    pure
  };
  if (Owner === null) ;else if (Owner !== UNOWNED) {
    {
      if (!Owner.owned) Owner.owned = [c];else Owner.owned.push(c);
    }
  }
  return c;
}
function runTop(node) {
  if ((node.state) === 0) return;
  if ((node.state) === PENDING) return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (node.state) ancestors.push(node);
  }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    node = ancestors[i];
    if ((node.state) === STALE) {
      updateComputation(node);
    } else if ((node.state) === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
}
function runUpdates(fn, init) {
  if (Updates) return fn();
  let wait = false;
  if (!init) Updates = [];
  if (Effects) wait = true;else Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait) Effects = null;
    Updates = null;
    handleError(err);
  }
}
function completeUpdates(wait) {
  if (Updates) {
    runQueue(Updates);
    Updates = null;
  }
  if (wait) return;
  const e = Effects;
  Effects = null;
  if (e.length) runUpdates(() => runEffects(e), false);
}
function runQueue(queue) {
  for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}
function runUserEffects(queue) {
  let i,
    userLength = 0;
  for (i = 0; i < queue.length; i++) {
    const e = queue[i];
    if (!e.user) runTop(e);else queue[userLength++] = e;
  }
  for (i = 0; i < userLength; i++) runTop(queue[i]);
}
function lookUpstream(node, ignore) {
  node.state = 0;
  for (let i = 0; i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount)) runTop(source);
      } else if (state === PENDING) lookUpstream(source, ignore);
    }
  }
}
function markDownstream(node) {
  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (!o.state) {
      o.state = PENDING;
      if (o.pure) Updates.push(o);else Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(),
        index = node.sourceSlots.pop(),
        obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(),
          s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (node.owned) {
    for (i = node.owned.length - 1; i >= 0; i--) cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1; i >= 0; i--) node.cleanups[i]();
    node.cleanups = null;
  }
  node.state = 0;
  node.context = null;
}
function handleError(err) {
  throw err;
}
function lookup(owner, key) {
  return owner ? owner.context && owner.context[key] !== undefined ? owner.context[key] : lookup(owner.owner, key) : undefined;
}

const hempty = () => [];
// export const hput = <K, V>(key: K, value: V, map: HashMap<K, V>): HashMap<K, V> => 
// 	[ ...map.filter(([ k ]) => k !== key), [ key, value ]];
// export const hget = <K, V>(key: K, map: HashMap<K, V>): V | undefined => 
// 	map.find(([ k ]) => k === key)?.[1];
// export const hremove = <K, V>(key: K, map: HashMap<K, V>): HashMap<K, V> => 
// 	map.filter(([ k ]) => k !== key);
const hput = (map) => (key, value) => [...map.filter(([k]) => k !== key), [key, value]];
const hget = (map) => (key) => map.find(([k]) => k === key)?.[1];

function createNode(value, left = null, right = null) {
    return { value, countLinks: 1, left, right };
}
function insert(tree, value) {
    if (tree === null)
        return createNode(value);
    if (value === tree.value)
        return { ...tree, countLinks: tree.countLinks + 1 };
    else if (value < tree.value)
        return { ...tree, left: insert(tree.left, value) };
    else
        return { ...tree, right: insert(tree.right, value) };
}
function find(tree, value) {
    if (tree === null)
        return null;
    if (tree.value === value)
        return tree;
    if (value < tree.value)
        return find(tree.left, value);
    else
        return find(tree.right, value);
}
function getLinkCount(tree, value) {
    const node = find(tree, value);
    return node ? node.countLinks : 0;
}
function incrementLink(tree, value) {
    if (tree === null)
        return null;
    if (value === tree.value)
        return { ...tree, countLinks: tree.countLinks + 1 };
    if (value < tree.value)
        return { ...tree, left: incrementLink(tree.left, value) };
    else
        return { ...tree, right: incrementLink(tree.right, value) };
}
function decrementLink(tree, value) {
    if (tree === null)
        return null;
    if (value === tree.value)
        return tree.countLinks > 1 ? { ...tree, countLinks: tree.countLinks - 1 } : null;
    if (value < tree.value)
        return { ...tree, left: decrementLink(tree.left, value) };
    else
        return { ...tree, right: decrementLink(tree.right, value) };
}
function minValueNode(node) {
    let current = node;
    while (current.left !== null) {
        current = current.left;
    }
    return current;
}
function remove(tree, value) {
    if (tree === null)
        return tree;
    if (value < tree.value)
        tree.left = remove(tree.left, value);
    else if (value > tree.value)
        tree.right = remove(tree.right, value);
    else {
        if (tree.left === null)
            return tree.right;
        else if (tree.right === null)
            return tree.left;
        tree.value = minValueNode(tree.right).value;
        tree.right = remove(tree.right, tree.value);
    }
    return tree;
}

const createTag = () => {
    const tag = document.createElement("style");
    tag.setAttribute("id", "srt_style");
    document.head.appendChild(tag);
    return tag;
};
const createMediaStyle = (media) => {
    let styleSheet = document.head.querySelector("style#srt_style");
    if (styleSheet == null)
        styleSheet = createTag();
    styleSheet.sheet.insertRule(`@media ${media} {}`, styleSheet.sheet.cssRules.length);
    return styleSheet;
};
const deleteStyles = (hash, sheet) => {
    const count = getLinkCount(window["SrtClasses"], hash);
    if (count == 1) {
        window["SrtClasses"] = remove(window["SrtClasses"], hash);
        getIndexes(Array.from(sheet.cssRules), (e) => e.cssText.includes(hash))
            .forEach(index => sheet.deleteRule(index));
        Array.from(sheet.cssRules).filter(r => r.type == 4)
            .forEach((media) => {
            getIndexes(Array.from(media.cssRules), (e) => e.cssText.includes(hash))
                .forEach(index => sheet.deleteRule(index));
        });
    }
    else
        window["SrtClass"] = decrementLink(window["SrtClasses"], hash);
};
function getIndexes(array, testFunction) {
    return array.reduce((accumulator, element, index) => testFunction(element) ? [...accumulator, index] : accumulator, []);
}

const isPrimitive = (value) => (["string", "number"].includes(typeof value) ||
    (typeof value == "function" && value["isUnit"]) &&
        String(value) != "[object Object]" &&
        !Array.isArray(value));
const isFunction = (value) => (typeof value == "function" &&
    !value["isUnit"] &&
    String(value) != "[object Object]" &&
    !Array.isArray(value));
const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};
const extractStyle = (obj) => {
    return Object.entries(obj)
        .filter(([key]) => key !== "mixins")
        .reduce((acc, [key, value]) => {
        if (isPrimitive(value))
            acc[0][key] = value;
        else if (isFunction(value))
            acc[1][key] = value;
        else if (key === "computed")
            acc[2] = [...acc[2], ...value];
        else {
            const [prim, dyn] = extractStyle(value);
            if (!isEmptyObject(prim))
                acc[0][key] = prim;
            if (!isEmptyObject(dyn))
                acc[1][key] = dyn;
        }
        return acc;
    }, [{}, {}, []]);
};
const regex = /^\s*([\.#>+\[\]:\s\w-]+)/;
const separateArrays = (css) => {
    return Object.entries(css).reduce((acc, [key, value]) => {
        if (isPrimitive(value))
            acc[0][key] = value;
        else {
            if (regex.test(key))
                acc[1][key] = value;
            else
                acc[2][key] = value;
        }
        return acc;
    }, [{}, {}, {}]);
};
const dynamicToPrimitive = (css, props) => {
    return Object.fromEntries(Object.entries(css)
        .map(([key, value]) => {
        return isPrimitive(value)
            ? [key, value]
            : isFunction(value)
                ? [key, value(props)]
                : [key, dynamicToPrimitive(value, props)];
    }));
};

const getStringCSS = (css) => Object.entries(css)
    .map(([key, value]) => `${String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()}:${value};`)
    .join(" ");

const generateHash = (str, prefix = "") => {
    const sum = [...str]
        .reduce((sum, char) => sum + Math.sqrt(char.charCodeAt(0)), 0);
    return `${prefix != "" ? prefix : "s"}${sum.toString(32).slice(-6).toUpperCase()}`;
};
const generateSelector = (className, selector) => {
    return selector === "" ? className : selector.replace("&", className);
};

/* eslint-disable no-useless-escape */
const writeStaticStyle = (hash = "", css, sheet, theme, prefix = "", writen = true) => {
    const [primitiveRules, mediaRules, selectorRules] = separateArrays(css);
    hash = hash || `.${generateHash(JSON.stringify(css), prefix)}`;
    if (find(window["SrtClasses"], hash) === null) {
        window["SrtClasses"] = insert(window["SrtClasses"], hash);
        sheet.insertRule(`${hash} { ${getStringCSS(primitiveRules)} }`);
        Object.entries(selectorRules)
            .forEach(([key, value]) => {
            const selector = generateSelector(hash, key);
            writeStaticStyle(selector, value, sheet, theme, "", writen);
        });
        Object.entries(mediaRules).forEach(([media, value]) => {
            writeMediaStyle(hash, value, Array.from(sheet.cssRules)
                .find(n => n["conditionText"] == theme(media)));
        });
    }
    else if (writen)
        window["SrtClasses"] = incrementLink(window["SrtClasses"], hash);
    return hash.slice(1);
};
const writeMediaStyle = (hash, css, sheet, media) => {
    const [primitiveRules, _, selectorRules] = separateArrays(css);
    sheet.insertRule(`${hash} { ${getStringCSS(primitiveRules)} }`);
    const mediaIndex = Array.from(sheet.cssRules)
        .findIndex((n) => n["selectorText"] == hash);
    if (mediaIndex >= 0)
        sheet.deleteRule(mediaIndex);
    sheet.insertRule(`${hash} { ${getStringCSS(primitiveRules)} }`);
    Object.entries(selectorRules)
        .forEach(([key, value]) => {
        const selector = generateSelector(hash, key);
        if (find(window["SrtClasses"], selector) === null) {
            window["SrtClasses"] = insert(window["SrtClasses"], selector);
            writeMediaStyle(generateSelector(hash, key), value, sheet);
            console.log(selector);
        }
    });
};

/* eslint-disable @typescript-eslint/no-unused-vars */
const generateTheme = (theme) => {
    const sheet = createTag().sheet;
    window["SrtClasses"] = createNode("");
    const ntheme = Object.fromEntries(Object.entries(theme)
        .map(([key, value]) => {
        let hashTheme = hempty();
        if (key === "media") {
            Object.entries(value)
                .forEach(([, value]) => {
                createMediaStyle(value);
                hashTheme = hput(hashTheme)(key, value);
            });
        }
        Object.entries(value)
            .forEach(([key, value]) => (hashTheme = hput(hashTheme)(key, value)));
        return [key, hget(hashTheme)];
    }));
    return createCSS(ntheme, sheet);
};
const createCSS = (theme, sheet) => (prefix, css) => {
    if (css.mixins)
        css = css.mixins.reduce((acc, mix) => Object.assign({}, acc, mix), css);
    const [primitive, dynamic, computed] = extractStyle(css);
    const hash = writeStaticStyle("", primitive, sheet, theme.media, `${prefix == "" ? "" : prefix + "-"}s`);
    const hook = (props) => {
        const history = new Set();
        const [dynamicHash, setDynamicHash] = createSignal("");
        const [isWriten, setIsWriten] = createSignal(true);
        createEffect(() => {
            // console.log( computed.reduce((acc, func) => Object.assign(acc, func(props)), {}) );
            setDynamicHash(writeStaticStyle("", dynamicToPrimitive(computed.length > 0
                ? Object.assign({}, dynamic, computed.reduce((acc, func) => Object.assign(acc, func(props)), {}))
                : dynamic, Object.assign({}, props, theme)), sheet, theme.media, `${prefix == "" ? "" : prefix + "-"}d`, isWriten()));
            setIsWriten(false);
            history.add(dynamicHash());
        });
        onCleanup(() => {
            deleteStyles(`.${hash}`, sheet);
            Array.from(history).forEach(h => deleteStyles(`.${h}`, sheet));
        });
        return () => `${hash} ${dynamicHash()}`;
        // const className = () => `${hash} ${dynamicHash()}`;
        // className.toString = className; 
        // return className as unknown as string;
    };
    hook.rules = css;
    return hook;
};

export { generateTheme };
//# sourceMappingURL=index.js.map
