// Kopfsache – Python im Hintergrund (Pyodide). Wird von build/cw_build.py erzeugt.
const BASE = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/";
importScripts(BASE + 'pyodide.js');
const RUNNER = "\nimport sys, io, json, traceback\ndef _kp_err(e, code):\n    t = type(e).__name__; msg = str(e); ln = None\n    if isinstance(e, SyntaxError) and e.filename == \"<dein Code>\":\n        ln = e.lineno; msg = e.msg\n    else:\n        for fr in traceback.extract_tb(e.__traceback__):\n            if fr.filename == \"<dein Code>\": ln = fr.lineno\n    return {\"type\": t, \"msg\": msg, \"line\": ln}\ndef _kp_exec(req, extra=None):\n    out = io.StringIO(); g = {\"__name__\": \"__main__\"}; err = None\n    old = sys.stdout; sys.stdout = out\n    try:\n        exec(compile(req[\"prelude\"], \"<prelude>\", \"exec\"), g)\n        if req.get(\"setup\"): exec(compile(req[\"setup\"], \"<setup>\", \"exec\"), g)\n        if req.get(\"given\"): exec(compile(req[\"given\"], \"<given>\", \"exec\"), g)\n        ins = list(req.get(\"inputs\") or [])\n        if extra:\n            for k, v in extra.items():\n                if k == \"_inputs\": ins = list(v)\n                else: g[k] = v\n        g[\"_INPUTS\"][:] = ins\n        try:\n            exec(compile(req[\"code\"], \"<dein Code>\", \"exec\"), g)\n        except BaseException as e:\n            err = _kp_err(e, req[\"code\"])\n    finally:\n        sys.stdout = old\n    g[\"_out\"] = out.getvalue()\n    return g, err\ndef _kp_run(rj):\n    req = json.loads(rj)\n    g, err = _kp_exec(req)\n    res = {\"out\": g[\"_out\"][-20000:], \"err\": err, \"check\": None, \"turtle\": None}\n    t = g.get(\"_TURTLE\")\n    if t is not None: res[\"turtle\"] = t.export()\n    if err is None and req.get(\"check\"):\n        def _run(**kw):\n            g2, e2 = _kp_exec(req, kw)\n            assert e2 is None, \"Mit %s bricht dein Code ab: %s \u2013 %s\" % (\", \".join(\"%s = %r\" % x for x in kw.items() if x[0] != \"_inputs\") or \"anderen Eingaben\", e2[\"type\"], e2[\"msg\"])\n            return g2\n        g[\"_user\"] = req[\"code\"]; g[\"_run\"] = _run\n        old = sys.stdout; sys.stdout = io.StringIO()\n        try:\n            exec(compile(req[\"check\"], \"<check>\", \"exec\"), g); res[\"check\"] = {\"ok\": True, \"msg\": \"\"}\n        except AssertionError as e:\n            res[\"check\"] = {\"ok\": False, \"msg\": str(e) or \"Noch nicht ganz richtig.\"}\n        except BaseException as e:\n            res[\"check\"] = {\"ok\": False, \"msg\": \"Beim Pr\u00fcfen ist ein Fehler aufgetreten (%s: %s)\" % (type(e).__name__, e)}\n        finally:\n            sys.stdout = old\n    return json.dumps(res, default=str)\n";

let py = null, boot = null; const have = new Set();
async function start(){ py = await loadPyodide({ indexURL: BASE }); py.runPython(RUNNER); }
self.onmessage = async (e) => {
  const d = e.data;
  try {
    if (!boot){ self.postMessage({ id: d.id, phase: 'boot' }); boot = start().catch(err => { boot = null; py = null; throw err; }); }
    await boot;
    const need = (d.pkgs || []).filter(p => !have.has(p));
    if (need.length){ self.postMessage({ id: d.id, phase: 'pkg', pkgs: need }); await py.loadPackage(need); need.forEach(p => have.add(p)); }
    if (d.warm){ self.postMessage({ id: d.id, phase: 'done', res: null }); return; }
    self.postMessage({ id: d.id, phase: 'run' });
    const fn = py.globals.get('_kp_run'); const r = fn(JSON.stringify(d.req)); fn.destroy();
    self.postMessage({ id: d.id, phase: 'done', res: JSON.parse(r) });
  } catch (err){
    self.postMessage({ id: d.id, phase: 'fail', msg: String((err && err.message) || err).slice(0, 300) });
  }
};
