/*
* Suppose you need to make a sequence of calls to some database to fetch data.
* Also suppose that you only need to fetch N records, which may be satisfied by some K calls to the database.
* How do you chain your promises to do exactly this?
* ...
* Here's one way..
*
*/


var aFilled = [];

function someAsyncDataGetter(limit) {
    var a = [];
    for (let i = 0; i < limit; ++i) {
        a.push(Math.random());
    }
    return a;
}

function condIterPromise(fnCondition, aFnElems, oPayload) {
    var promise = Promise.resolve(oPayload);
    var cond_apply = (fn) => {
            return (payload) => {
                if (fnCondition(payload)) {
                    return Promise.resolve(payload);
                } 
                var ret = fn(payload);
                if (ret.constructor === Promise) { return ret; }
                return Promise.resolve(ret);
            }
        };
    for (let i = 0, ie = aFnElems.length; i < ie; ++i) {
        promise = promise.then((payload) => {
            return cond_apply(aFnElems[i])(payload)
        });
    }
    return promise;
}

function imit(aLimits) {
    var putter = (x) => {
        return (payload) => {
            let f = someAsyncDataGetter(x);
            for (let i = 0; i < f.length; ++i) {
                payload.push( f[i] );
            }
            return Promise.resolve(payload);
        };
    };
    return condIterPromise(
        (p) => (p.length >= 20),
        aLimits.map((x) => putter(x)),
        aFilled
    );
}

var lims = [ 1, 3, 4, 5, 3, 3, 1, 2, 3];
imit(lims)
    .then((x) => console.log(x))
    .catch((err)=>console.log("err" + err));
