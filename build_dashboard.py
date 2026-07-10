
# BURNO AI — Full Dashboard Builder
# Generates: frontend/public/burno.html
# Views: Dashboard, Chat, Agents, Memory, Voice

PART1 = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>BURNO AI - Personal Intelligence Engine</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
:root{--bg:#050816;--c:#00E5FF;--p:#8B5CF6;--g:#10B981;--k:#EC4899;--y:#F59E0B;--w:#E2EEFF;--m:rgba(226,238,255,.45);--d:rgba(226,238,255,.18);--gl:rgba(255,255,255,.03);--br:rgba(255,255,255,.06)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden}
body{background:var(--bg);font-family:'Inter',sans-serif;color:var(--w);display:flex}
#nbg{position:fixed;inset:0;z-index:0;pointer-events:none}
.grid-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,229,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.025) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)}
.ptx{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.pt{position:absolute;border-radius:50%;animation:fpt linear infinite}
@keyframes fpt{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:1}90%{opacity:.6}100%{transform:translateY(-20px) scale(1);opacity:0}}
.app{position:relative;z-index:1;display:grid;grid-template-columns:72px 1fr 360px;width:100%;height:100vh}
/* SIDEBAR */
.sb{display:flex;flex-direction:column;align-items:center;padding:20px 0;gap:4px;border-right:1px solid var(--br);backdrop-filter:blur(20px);background:rgba(5,8,22,.6)}
.logo{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--c),var(--p));margin-bottom:18px;font-size:18px;font-weight:800;font-family:'Space Grotesk',sans-serif;color:#050816;cursor:pointer;box-shadow:0 0 24px rgba(0,229,255,.4)}
.ni{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;position:relative;border:1px solid transparent;transition:all .25s cubic-bezier(.16,1,.3,1);color:var(--m)}
.ni:hover,.ni.act{background:rgba(0,229,255,.08);border-color:rgba(0,229,255,.2);color:var(--c);box-shadow:0 0 16px rgba(0,229,255,.1)}
.ni.act::before{content:'';position:absolute;left:-1px;width:3px;height:22px;border-radius:0 3px 3px 0;background:var(--c);box-shadow:0 0 8px var(--c)}
.ni:hover::after{content:attr(data-t);position:absolute;left:58px;background:rgba(5,8,22,.98);border:1px solid var(--br);color:var(--w);font-size:11px;padding:5px 10px;border-radius:8px;white-space:nowrap;z-index:200;pointer-events:none}
.sp{flex:1}
/* VIEWS */
.view{position:absolute;inset:0;display:flex;flex-direction:column;opacity:0;pointer-events:none;transition:opacity .3s ease;overflow:hidden}
.view.active{opacity:1;pointer-events:all}
/* CENTER */
.ctr{position:relative;display:flex;flex-direction:column;overflow:hidden;background:rgba(5,8,22,.2)}
/* ORB */
.ow{position:relative;width:230px;height:230px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
#oc{position:absolute;inset:0;width:100%;height:100%}
.vr{position:absolute;inset:-26px;border-radius:50%;border:1px solid rgba(0,229,255,.1);animation:sr 9s linear infinite}
.vr:nth-child(2){inset:-46px;border-color:rgba(139,92,246,.09);animation-duration:14s;animation-direction:reverse}
.vr:nth-child(3){inset:-66px;border-color:rgba(16,185,129,.06);animation-duration:22s}
.vr .rd{position:absolute;width:5px;height:5px;border-radius:50%;top:-2.5px;left:50%;transform:translateX(-50%)}
.vr:nth-child(1) .rd{background:var(--c);box-shadow:0 0 8px var(--c)}.vr:nth-child(2) .rd{background:var(--p);box-shadow:0 0 8px var(--p)}.vr:nth-child(3) .rd{background:var(--g);box-shadow:0 0 6px var(--g)}
@keyframes sr{to{transform:rotate(360deg)}}
.idn{text-align:center;margin-top:14px}
.aname{font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;letter-spacing:-1.5px;background:linear-gradient(135deg,var(--c) 0%,var(--p) 50%,var(--k) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.asub{font-size:10px;letter-spacing:.3em;color:var(--m);text-transform:uppercase;margin-top:3px}
.spill{display:inline-flex;align-items:center;gap:7px;padding:5px 14px;border-radius:100px;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.2);font-size:10px;font-weight:500;letter-spacing:.1em;color:var(--c);text-transform:uppercase;margin-top:10px;transition:all .4s ease}
.sdot{width:6px;height:6px;border-radius:50%;background:var(--c);box-shadow:0 0 6px var(--c);animation:pd 1.8s ease-in-out infinite}
@keyframes pd{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
.pw{width:100%;max-width:540px;margin-top:14px;position:relative}
.pb{width:100%;padding:13px 54px 13px 20px;background:rgba(255,255,255,.03);border:1px solid rgba(0,229,255,.2);border-radius:18px;color:var(--w);font-size:14px;font-family:'Inter',sans-serif;outline:none;backdrop-filter:blur(24px);transition:all .3s ease}
.pb::placeholder{color:var(--d)}.pb:focus{border-color:rgba(0,229,255,.5);box-shadow:0 0 0 3px rgba(0,229,255,.07)}
.psend{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:11px;background:linear-gradient(135deg,var(--c),var(--p));border:none;cursor:pointer;font-size:15px;transition:all .2s;box-shadow:0 0 14px rgba(0,229,255,.25);display:flex;align-items:center;justify-content:center;color:#050816;font-weight:700}
.psend:hover{transform:translateY(-50%) scale(1.1);box-shadow:0 0 24px rgba(0,229,255,.45)}
.qa{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px;max-width:540px}
.qc{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:100px;background:var(--gl);border:1px solid var(--br);font-size:11px;color:var(--m);cursor:pointer;transition:all .2s cubic-bezier(.16,1,.3,1);white-space:nowrap}
.qc:hover{background:rgba(0,229,255,.07);border-color:rgba(0,229,255,.25);color:var(--w);transform:translateY(-2px)}
/* MINI AGENT CARDS */
.agnet{position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:6px;padding:0 12px}
.ac{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:12px;background:rgba(5,8,22,.85);border:1px solid var(--br);backdrop-filter:blur(16px);font-size:10px;cursor:pointer;transition:all .25s;animation:fc 4s ease-in-out infinite}
.ac:nth-child(2){animation-delay:.7s}.ac:nth-child(3){animation-delay:1.4s}.ac:nth-child(4){animation-delay:2.1s}.ac:nth-child(5){animation-delay:2.8s}
.ac:hover{transform:translateY(-5px) !important;border-color:rgba(0,229,255,.3);box-shadow:0 8px 24px rgba(0,0,0,.4)}
@keyframes fc{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.adot{width:5px;height:5px;border-radius:50%;flex-shrink:0}.albl{color:var(--d);font-size:9px;margin-top:1px}
/* CHAT */
.chat-panel{position:absolute;inset:0;display:flex;flex-direction:column;background:rgba(5,8,22,.97);backdrop-filter:blur(32px);z-index:50;transform:translateY(100%);transition:transform .4s cubic-bezier(.16,1,.3,1)}
.chat-panel.open{transform:translateY(0)}
.chat-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--br);flex-shrink:0}
.chat-orb-icon{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,rgba(0,229,255,.2),rgba(139,92,246,.15));border:1px solid rgba(0,229,255,.25);display:flex;align-items:center;justify-content:center;font-size:14px}
.chat-close{width:28px;height:28px;border-radius:8px;border:1px solid var(--br);background:var(--gl);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;color:var(--m);transition:all .2s}
.chat-close:hover{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2);color:#ef4444}
.chat-msgs{flex:1;overflow-y:auto;padding:14px 18px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
.chat-msgs::-webkit-scrollbar{width:3px}.chat-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
.msg{display:flex;gap:10px;animation:msgin .3s cubic-bezier(.16,1,.3,1)}
@keyframes msgin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.msg.user{flex-direction:row-reverse}
.msg-av{width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;margin-top:2px}
.msg.ai .msg-av{background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(139,92,246,.1));border:1px solid rgba(0,229,255,.2)}
.msg.user .msg-av{background:linear-gradient(135deg,rgba(59,130,246,.15),rgba(99,102,241,.1));border:1px solid rgba(59,130,246,.2)}
.msg-body{flex:1;max-width:82%}.msg.user .msg-body{display:flex;flex-direction:column;align-items:flex-end}
.msg-agent{font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px}
.msg-bubble{padding:11px 15px;border-radius:16px;font-size:13px;line-height:1.7}
.msg.ai .msg-bubble{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:4px 16px 16px 16px}
.msg.user .msg-bubble{background:linear-gradient(135deg,rgba(59,130,246,.12),rgba(99,102,241,.08));border:1px solid rgba(59,130,246,.18);border-radius:16px 4px 16px 16px}
.msg-meta{font-size:9px;color:var(--d);margin-top:4px;display:flex;align-items:center;gap:6px}.msg.user .msg-meta{justify-content:flex-end}
.msg-badge{padding:1px 6px;border-radius:100px;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.12);color:rgba(0,229,255,.8);font-size:8px;font-weight:600}
.tts-btn{width:22px;height:22px;border-radius:7px;border:1px solid rgba(0,229,255,.15);background:rgba(0,229,255,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;transition:all .2s;color:rgba(0,229,255,.7)}
.tts-btn:hover{background:rgba(0,229,255,.12);border-color:rgba(0,229,255,.3)}
.tts-btn.playing{background:rgba(0,229,255,.15);border-color:rgba(0,229,255,.4);animation:pd .8s ease-in-out infinite}
.thinking{display:flex;align-items:center;gap:5px;padding:10px 14px;border-radius:4px 14px 14px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);width:fit-content}
.td{width:5px;height:5px;border-radius:50%;opacity:.4;animation:tda .9s ease-in-out infinite}
.td:nth-child(1){background:var(--c)}.td:nth-child(2){background:var(--p);animation-delay:.15s}.td:nth-child(3){background:var(--g);animation-delay:.3s}
@keyframes tda{0%,80%,100%{transform:scale(.7);opacity:.3}40%{transform:scale(1.3);opacity:1}}
.code-block{background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.08);border-radius:10px;margin:8px 0;overflow:hidden}
.code-header{display:flex;align-items:center;justify-content:space-between;padding:5px 12px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.06)}
.code-lang{font-size:10px;color:var(--m);font-family:'JetBrains Mono',monospace}
.code-copy{font-size:9px;color:var(--d);cursor:pointer;background:none;border:none;font-family:'Inter',sans-serif;transition:color .2s;padding:0}
.code-copy:hover{color:var(--c)}
.code-body{padding:12px;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.6;overflow-x:auto;color:#a8d8ff;white-space:pre}
.chat-input-wrap{padding:12px 18px;border-top:1px solid var(--br);flex-shrink:0;display:flex;gap:9px;align-items:flex-end}
.chat-input{flex:1;padding:11px 15px;background:rgba(255,255,255,.03);border:1px solid rgba(0,229,255,.2);border-radius:13px;color:var(--w);font-size:13px;font-family:'Inter',sans-serif;outline:none;resize:none;max-height:110px;min-height:42px;transition:all .3s;line-height:1.5}
.chat-input::placeholder{color:var(--d)}.chat-input:focus{border-color:rgba(0,229,255,.45);box-shadow:0 0 0 3px rgba(0,229,255,.06)}
.chat-send{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--c),var(--p));border:none;cursor:pointer;font-size:15px;transition:all .2s;box-shadow:0 0 14px rgba(0,229,255,.25);color:#050816;font-weight:700;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.chat-send:hover{transform:scale(1.08);box-shadow:0 0 24px rgba(0,229,255,.4)}.chat-send:disabled{opacity:.4;cursor:not-allowed;transform:none}
/* SCROLLABLE VIEWS (Agents, Memory, Voice) */
.scroll-view{padding:18px 22px;overflow-y:auto;width:100%;height:100%}
.scroll-view::-webkit-scrollbar{width:3px}.scroll-view::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
.view-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;gap:12px}
.view-title{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;background:linear-gradient(135deg,var(--c),var(--p));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.view-sub{font-size:11px;color:var(--m);margin-top:3px}
/* STAT STRIP */
.stat-strip{display:flex;gap:8px;margin-bottom:18px}
.stat-box{flex:1;padding:12px 14px;border-radius:13px;background:var(--gl);border:1px solid var(--br);text-align:center}
.stat-val{font-family:'Space Grotesk',sans-serif;font-size:21px;font-weight:700}
.stat-lbl{font-size:9px;color:var(--d);text-transform:uppercase;letter-spacing:.08em;margin-top:3px}
/* AGENTS GRID */
.agents-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.agent-card{padding:16px;border-radius:17px;background:rgba(5,8,22,.6);border:1px solid var(--br);transition:all .3s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden}
.agent-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.5)}
.acf-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px}
.acf-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:19px;border:1px solid rgba(255,255,255,.07);flex-shrink:0}
.status-badge{display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:100px;font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.status-badge.active{background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);color:#10B981}
.status-badge.standby{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);color:#F59E0B}
.status-badge.processing{background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.25);color:#8B5CF6}
.acf-name{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;margin-bottom:3px}
.acf-desc{font-size:10px;color:var(--m);line-height:1.5;margin-bottom:10px}
.caps{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:12px}
.cap{padding:2px 7px;border-radius:100px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);font-size:9px;color:var(--d)}
.metrics-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-bottom:12px}
.metric-box{text-align:center;padding:7px 3px;border-radius:9px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04)}
.metric-val{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700}
.metric-lbl{font-size:8px;color:var(--d);margin-top:2px;text-transform:uppercase;letter-spacing:.05em}
.prog-wrap{margin:8px 0 4px;height:2px;border-radius:2px;background:rgba(255,255,255,.05);overflow:hidden}
.prog-bar{height:100%;border-radius:2px;transition:width 1.2s ease}
.agent-actions{display:flex;gap:6px;margin-top:10px}
/* BUTTONS */
.btn{padding:7px 12px;border-radius:10px;font-size:11px;font-weight:500;border:1px solid;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.btn-primary{background:linear-gradient(135deg,var(--c),var(--p));border-color:transparent;color:#050816;font-weight:600}
.btn-primary:hover{box-shadow:0 0 18px rgba(0,229,255,.3);transform:translateY(-1px)}
.btn-ghost{background:var(--gl);border-color:var(--br);color:var(--m)}
.btn-ghost:hover{background:rgba(255,255,255,.06);color:var(--w)}
.btn-danger{background:rgba(239,68,68,.05);border-color:rgba(239,68,68,.2);color:#ef4444}
.btn-danger:hover{background:rgba(239,68,68,.1)}
.btn-sm{padding:6px 10px;font-size:10px;border-radius:9px}
/* TASK MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);z-index:300;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s}
.overlay.open{opacity:1;pointer-events:all}
.modal{width:500px;max-width:92vw;background:rgba(8,12,28,.97);border:1px solid rgba(0,229,255,.15);border-radius:20px;padding:22px;box-shadow:0 32px 80px rgba(0,0,0,.7);animation:modalin .3s cubic-bezier(.16,1,.3,1)}
@keyframes modalin{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}
.modal-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.modal-title{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700}
.modal-close{width:28px;height:28px;border-radius:8px;border:1px solid var(--br);background:var(--gl);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;color:var(--m);transition:all .2s}
.modal-close:hover{background:rgba(239,68,68,.08);color:#ef4444;border-color:rgba(239,68,68,.2)}
.modal-ta{width:100%;padding:11px 15px;background:rgba(255,255,255,.03);border:1px solid rgba(0,229,255,.2);border-radius:12px;color:var(--w);font-size:13px;font-family:'Inter',sans-serif;outline:none;resize:vertical;min-height:90px;line-height:1.6;margin-bottom:12px}
.modal-ta:focus{border-color:rgba(0,229,255,.45);box-shadow:0 0 0 3px rgba(0,229,255,.06)}
.modal-result{padding:13px;background:rgba(0,229,255,.03);border:1px solid rgba(0,229,255,.1);border-radius:11px;font-size:12px;line-height:1.7;margin-top:12px;max-height:200px;overflow-y:auto;display:none}
.modal-result.show{display:block}
/* MEMORY VIEW */
.mem-toolbar{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center}
.mem-search{flex:1;min-width:180px;padding:9px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(0,229,255,.2);border-radius:12px;color:var(--w);font-size:12px;font-family:'Inter',sans-serif;outline:none;transition:all .3s}
.mem-search::placeholder{color:var(--d)}.mem-search:focus{border-color:rgba(0,229,255,.45);box-shadow:0 0 0 3px rgba(0,229,255,.06)}
.cat-filter{display:flex;gap:5px;flex-wrap:wrap}
.cat-btn{padding:5px 11px;border-radius:100px;font-size:10px;font-weight:500;border:1px solid var(--br);background:var(--gl);color:var(--m);cursor:pointer;transition:all .2s}
.cat-btn.active{background:rgba(0,229,255,.1);border-color:rgba(0,229,255,.3);color:var(--c)}
.cat-btn:hover{color:var(--w)}
.mem-list{display:flex;flex-direction:column;gap:8px}
.mem-card{padding:14px 16px;border-radius:14px;background:rgba(5,8,22,.6);border:1px solid var(--br);transition:all .25s;position:relative;cursor:default}
.mem-card:hover{border-color:rgba(0,229,255,.15);box-shadow:0 8px 24px rgba(0,0,0,.4)}
.mem-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px}
.mem-content{font-size:12px;line-height:1.65;color:var(--w);flex:1}
.mem-actions{display:flex;gap:5px;flex-shrink:0}
.mem-cat{font-size:9px;font-weight:600;padding:2px 7px;border-radius:100px;text-transform:uppercase;letter-spacing:.08em}
.mem-meta{display:flex;align-items:center;gap:10px;margin-top:8px}
.mem-time{font-size:9px;color:var(--d)}
.mem-tags{display:flex;gap:4px}
.mem-tag{font-size:9px;padding:1px 6px;border-radius:100px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);color:var(--d)}
.mem-empty{text-align:center;padding:40px;color:var(--m);font-size:13px}
.mem-add-panel{padding:16px;border-radius:15px;background:rgba(0,229,255,.03);border:1px dashed rgba(0,229,255,.2);margin-bottom:14px}
.mem-add-title{font-size:11px;font-weight:600;color:var(--c);margin-bottom:10px;letter-spacing:.08em;text-transform:uppercase}
.mem-add-row{display:flex;gap:8px;align-items:flex-end}
.mem-add-ta{flex:1;padding:9px 12px;background:rgba(255,255,255,.03);border:1px solid rgba(0,229,255,.15);border-radius:11px;color:var(--w);font-size:12px;font-family:'Inter',sans-serif;outline:none;resize:none;min-height:60px;line-height:1.55;transition:all .3s}
.mem-add-ta:focus{border-color:rgba(0,229,255,.4);box-shadow:0 0 0 2px rgba(0,229,255,.05)}
.mem-cat-sel{padding:9px 12px;background:rgba(255,255,255,.03);border:1px solid rgba(0,229,255,.15);border-radius:11px;color:var(--m);font-size:11px;font-family:'Inter',sans-serif;outline:none;cursor:pointer;min-width:110px}
.mem-cat-sel option{background:#050816}
/* VOICE VIEW */
.voice-view{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:20px;text-align:center;gap:20px}
.voice-orb-wrap{position:relative;width:180px;height:180px;flex-shrink:0}
.voice-orb{width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(0,229,255,.9),rgba(139,92,246,.6) 60%,rgba(16,185,129,.2));box-shadow:0 0 40px rgba(0,229,255,.3),0 0 80px rgba(139,92,246,.15);transition:all .4s ease;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:32px}
.voice-orb.listening{animation:voicepulse 1s ease-in-out infinite;box-shadow:0 0 60px rgba(0,229,255,.5),0 0 120px rgba(0,229,255,.2)}
.voice-orb.speaking{animation:voicepulse 0.6s ease-in-out infinite;background:radial-gradient(circle at 35% 35%,rgba(16,185,129,.9),rgba(0,229,255,.6) 60%,rgba(139,92,246,.2));box-shadow:0 0 60px rgba(16,185,129,.5)}
@keyframes voicepulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.voice-ring{position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(0,229,255,.15);animation:sr 6s linear infinite}
.voice-ring:nth-child(2){inset:-22px;border-color:rgba(139,92,246,.1);animation-duration:10s;animation-direction:reverse}
.waveform{width:260px;height:50px;display:flex;align-items:center;justify-content:center;gap:3px}
.wave-bar{width:4px;border-radius:2px;background:rgba(0,229,255,.4);transition:height .1s ease}
.voice-status{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:var(--c)}
.voice-transcript{max-width:420px;font-size:13px;line-height:1.7;color:var(--m);min-height:48px;padding:10px 16px;border-radius:12px;background:rgba(255,255,255,.02);border:1px solid var(--br)}
.tts-audio-bar{width:100%;max-width:400px;padding:10px 16px;border-radius:12px;background:rgba(0,229,255,.03);border:1px solid rgba(0,229,255,.1);display:flex;align-items:center;gap:10px;display:none}
.tts-audio-bar.show{display:flex}
.tts-audio-progress{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden}
.tts-audio-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--c),var(--p));width:0%;transition:width .3s}
.voice-commands{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:420px}
.voice-cmd{padding:9px 14px;border-radius:12px;background:var(--gl);border:1px solid var(--br);text-align:left;cursor:pointer;transition:all .2s}
.voice-cmd:hover{border-color:rgba(0,229,255,.2);background:rgba(0,229,255,.04);transform:translateY(-2px)}
.voice-cmd-text{font-size:11px;color:var(--w);font-style:italic}
.voice-cmd-agent{font-size:9px;color:var(--c);margin-top:2px;font-weight:600}
/* RIGHT PANEL */
.rp{display:flex;flex-direction:column;border-left:1px solid var(--br);backdrop-filter:blur(20px);background:rgba(5,8,22,.5);overflow:hidden}
.rp-sec{flex:1;display:flex;flex-direction:column;overflow:hidden}
.rp-sec+.rp-sec{border-top:1px solid var(--br)}
.rp-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px 8px;flex-shrink:0}
.rp-title{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--m)}
.rp-badge{padding:2px 7px;border-radius:100px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.15);font-size:9px;color:var(--c)}
.tl{flex:1;overflow-y:auto;padding:0 16px 12px}
.tl::-webkit-scrollbar{width:3px}.tl::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:4px}
.tl-item{display:flex;gap:9px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.025);animation:si .4s cubic-bezier(.16,1,.3,1)}
@keyframes si{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
.tl-line{display:flex;flex-direction:column;align-items:center;padding-top:2px;flex-shrink:0}
.tl-dot{width:7px;height:7px;border-radius:50%}.tl-bar{width:1px;flex:1;min-height:14px;opacity:.13;margin-top:3px}
.tl-body{flex:1;min-width:0}
.tl-t{font-size:11px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tl-d{font-size:9px;color:var(--d);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tl-m{font-size:8px;color:var(--d);margin-top:2px}
/* METRICS */
.metrics-grid{padding:0 16px 16px;display:grid;grid-template-columns:1fr 1fr;gap:6px}
.met-card{padding:11px 13px;border-radius:12px;background:var(--gl);border:1px solid var(--br);cursor:pointer;transition:all .25s}
.met-card:hover{border-color:rgba(255,255,255,.1);transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.35)}
.met-icon{font-size:13px;margin-bottom:6px}
.met-val{font-family:'Space Grotesk',sans-serif;font-size:19px;font-weight:700;background:linear-gradient(135deg,var(--w),var(--m));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.met-lbl{font-size:8px;color:var(--d);margin-top:2px;text-transform:uppercase;letter-spacing:.08em}
.met-trend{font-size:8px;margin-top:3px}
::-webkit-scrollbar{width:0}
</style>
</head>
<body>
<canvas id="nbg"></canvas>
<div class="grid-bg"></div>
<div class="ptx" id="ptx"></div>

<!-- AGENT TASK MODAL -->
<div class="overlay" id="taskOverlay" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <div class="modal-h">
      <div class="modal-title" id="modalTitle">Run Agent Task</div>
      <div class="modal-close" onclick="closeModal()">&#10005;</div>
    </div>
    <textarea id="modalInput" class="modal-ta" placeholder="Describe what you want this agent to do..."></textarea>
    <div style="display:flex;gap:7px">
      <button class="btn btn-primary" onclick="submitTask()">&#9654; Run Task</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
    <div class="modal-result" id="modalResult"></div>
  </div>
</div>

<div class="app">
  <!-- SIDEBAR -->
  <aside class="sb">
    <div class="logo">B</div>
    <div class="ni act" data-t="Dashboard" onclick="go('dash',this)">&#127968;</div>
    <div class="ni" data-t="AI Chat" onclick="go('chat',this)">&#128172;</div>
    <div class="ni" data-t="Agents" onclick="go('agents',this)">&#129302;</div>
    <div class="ni" data-t="Memory" onclick="go('memory',this)">&#129504;</div>
    <div class="ni" data-t="Voice" onclick="go('voice',this)">&#127897;</div>
    <div class="ni" data-t="Knowledge">&#128218;</div>
    <div class="ni" data-t="Workflows">&#9889;</div>
    <div class="ni" data-t="Analytics">&#128202;</div>
    <div class="sp"></div>
    <div class="ni" data-t="Settings">&#9881;</div>
  </aside>

  <!-- CENTER -->
  <main class="ctr">

    <!-- ===== DASHBOARD VIEW ===== -->
    <div class="view active" id="view-dash" style="align-items:center;justify-content:center">
      <div class="ow">
        <canvas id="oc" width="230" height="230"></canvas>
        <div class="vr"><div class="rd"></div></div>
        <div class="vr"><div class="rd"></div></div>
        <div class="vr"><div class="rd"></div></div>
      </div>
      <div class="idn">
        <div class="aname">BURNO AI</div>
        <div class="asub">Personal Intelligence Engine</div>
      </div>
      <div class="spill" id="spill"><div class="sdot" id="sdot"></div><span id="stxt">Online</span></div>
      <div class="pw">
        <input id="pi" class="pb" type="text" placeholder="Ask BURNO anything..." autocomplete="off"/>
        <button class="psend" onclick="sendPB()">&#10148;</button>
      </div>
      <div class="qa">
        <div class="qc" onclick="askQ('What are the latest AI breakthroughs?')">&#128269; Research</div>
        <div class="qc" onclick="askQ('Write a Python function to sort a list of dictionaries by a key')">&#128187; Code</div>
        <div class="qc" onclick="askQ('Create an automation workflow to summarize emails daily')">&#9889; Workflow</div>
        <div class="qc" onclick="askQ('Explain neural networks simply')">&#128216; Explain</div>
        <div class="qc" onclick="go('voice',document.querySelector('.ni[data-t=Voice]'))">&#127897; Voice</div>
        <div class="qc" onclick="go('memory',document.querySelector('.ni[data-t=Memory]'))">&#129504; Memory</div>
      </div>
      <!-- Chat panel slides up from inside dashboard -->
      <div class="chat-panel" id="chatPanel">
        <div class="chat-header">
          <div style="display:flex;align-items:center;gap:9px">
            <div class="chat-orb-icon">&#129504;</div>
            <div>
              <div style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600">BURNO AI Chat</div>
              <div style="font-size:10px;color:var(--m)" id="chatSub">6 agents online</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:7px">
            <div style="font-size:9px;color:var(--m);padding:3px 8px;border-radius:100px;border:1px solid var(--br)" id="provBadge">Live AI</div>
            <div class="chat-close" onclick="closeChat()">&#10005;</div>
          </div>
        </div>
        <div class="chat-msgs" id="chatMsgs"></div>
        <div class="chat-input-wrap">
          <textarea id="chatIn" class="chat-input" placeholder="Message BURNO... (Enter to send, Shift+Enter for new line)" rows="1"></textarea>
          <button class="chat-send" id="chatSend" onclick="sendChat()">&#10148;</button>
        </div>
      </div>
      <!-- Mini agent network -->
      <div class="agnet" id="agnet">
        <div class="ac" onclick="askQ('What can the Research Agent do?')"><div class="adot" style="background:#00E5FF;box-shadow:0 0 5px #00E5FF"></div><span>&#128269;</span><div><div style="font-weight:600">Research</div><div class="albl">Active</div></div></div>
        <div class="ac" onclick="askQ('Write me a Python function')"><div class="adot" style="background:#10B981;box-shadow:0 0 5px #10B981"></div><span>&#128187;</span><div><div style="font-weight:600">Coding</div><div class="albl">Standby</div></div></div>
        <div class="ac" onclick="askQ('Create a browser automation workflow')"><div class="adot" style="background:#8B5CF6;box-shadow:0 0 5px #8B5CF6"></div><span>&#9889;</span><div><div style="font-weight:600">Automation</div><div class="albl">Active</div></div></div>
        <div class="ac" onclick="askQ('What have you remembered?')"><div class="adot" style="background:#EC4899;box-shadow:0 0 5px #EC4899"></div><span>&#129504;</span><div><div style="font-weight:600">Memory</div><div class="albl">Indexing</div></div></div>
        <div class="ac" onclick="askQ('What can the Vision Agent analyze?')"><div class="adot" style="background:#F59E0B;box-shadow:0 0 5px #F59E0B"></div><span>&#128065;</span><div><div style="font-weight:600">Vision</div><div class="albl">Standby</div></div></div>
      </div>
    </div>

    <!-- ===== AGENTS VIEW ===== -->
    <div class="view" id="view-agents">
      <div class="scroll-view">
        <div class="view-header">
          <div>
            <div class="view-title">&#129302; Agent Network</div>
            <div class="view-sub">6 specialized AI agents — click Run Task to assign work directly</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="loadAgents()">&#8635; Refresh</button>
        </div>
        <div class="stat-strip" id="agStatStrip">
          <div class="stat-box"><div class="stat-val" style="color:#10B981" id="agStat1">-</div><div class="stat-lbl">Active</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#F59E0B" id="agStat2">-</div><div class="stat-lbl">Standby</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#00E5FF" id="agStat3">-</div><div class="stat-lbl">Tasks Done</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#8B5CF6" id="agStat4">-</div><div class="stat-lbl">Avg Success</div></div>
        </div>
        <div class="agents-grid" id="agentsGrid">
          <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--m)">Loading agents...</div>
        </div>
      </div>
    </div>

    <!-- ===== MEMORY VIEW ===== -->
    <div class="view" id="view-memory">
      <div class="scroll-view">
        <div class="view-header">
          <div>
            <div class="view-title">&#129504; Memory Bank</div>
            <div class="view-sub">Store, search and manage BURNO's knowledge and conversation memory</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="loadMemory()">&#8635; Refresh</button>
        </div>
        <!-- Stats -->
        <div class="stat-strip" id="memStatStrip">
          <div class="stat-box"><div class="stat-val" style="color:#00E5FF" id="memTotal">-</div><div class="stat-lbl">Total Memories</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#8B5CF6" id="memConv">-</div><div class="stat-lbl">Conversations</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#10B981" id="memKnow">-</div><div class="stat-lbl">Knowledge</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#F59E0B" id="memTask">-</div><div class="stat-lbl">Tasks</div></div>
        </div>
        <!-- Add new memory -->
        <div class="mem-add-panel">
          <div class="mem-add-title">&#43; Store New Memory</div>
          <div class="mem-add-row">
            <textarea id="memNewContent" class="mem-add-ta" placeholder="Enter memory content — a note, fact, conversation snippet, or anything BURNO should remember..."></textarea>
            <div style="display:flex;flex-direction:column;gap:7px">
              <select id="memNewCat" class="mem-cat-sel">
                <option value="conversation">Conversation</option>
                <option value="knowledge">Knowledge</option>
                <option value="task">Task</option>
                <option value="note">Note</option>
                <option value="preference">Preference</option>
              </select>
              <button class="btn btn-primary btn-sm" onclick="saveMemory()" style="justify-content:center">&#128190; Save</button>
            </div>
          </div>
        </div>
        <!-- Search + filter toolbar -->
        <div class="mem-toolbar">
          <input type="text" id="memSearch" class="mem-search" placeholder="&#128269; Search memories..." oninput="debounceSearch()"/>
          <div class="cat-filter" id="catFilter">
            <div class="cat-btn active" data-cat="all" onclick="filterCat('all',this)">All</div>
            <div class="cat-btn" data-cat="conversation" onclick="filterCat('conversation',this)">Conversation</div>
            <div class="cat-btn" data-cat="knowledge" onclick="filterCat('knowledge',this)">Knowledge</div>
            <div class="cat-btn" data-cat="task" onclick="filterCat('task',this)">Task</div>
            <div class="cat-btn" data-cat="note" onclick="filterCat('note',this)">Note</div>
            <div class="cat-btn" data-cat="preference" onclick="filterCat('preference',this)">Preference</div>
          </div>
        </div>
        <div class="mem-list" id="memList">
          <div class="mem-empty">Loading memories...</div>
        </div>
      </div>
    </div>

    <!-- ===== VOICE VIEW ===== -->
    <div class="view" id="view-voice">
      <div class="voice-view">
        <div>
          <div class="view-title" style="-webkit-text-fill-color:unset;background:none;color:var(--c)">&#127897; Voice Assistant</div>
          <div class="view-sub" style="text-align:center">Speak to BURNO — voice input + ElevenLabs AI speech output</div>
        </div>
        <div class="voice-orb-wrap">
          <div class="voice-ring"></div>
          <div class="voice-ring"></div>
          <div class="voice-orb" id="voiceOrb" onclick="toggleVoice()">&#127897;</div>
        </div>
        <div class="waveform" id="waveform">
          <div class="wave-bar" style="height:8px"></div><div class="wave-bar" style="height:14px"></div><div class="wave-bar" style="height:20px"></div><div class="wave-bar" style="height:10px"></div><div class="wave-bar" style="height:28px"></div><div class="wave-bar" style="height:18px"></div><div class="wave-bar" style="height:10px"></div><div class="wave-bar" style="height:22px"></div><div class="wave-bar" style="height:14px"></div><div class="wave-bar" style="height:8px"></div><div class="wave-bar" style="height:18px"></div><div class="wave-bar" style="height:26px"></div><div class="wave-bar" style="height:12px"></div><div class="wave-bar" style="height:8px"></div><div class="wave-bar" style="height:16px"></div>
        </div>
        <div class="voice-status" id="voiceStatus">Click orb to speak</div>
        <div class="voice-transcript" id="voiceTranscript">Your speech will appear here...</div>
        <!-- TTS audio playback bar -->
        <div class="tts-audio-bar" id="ttsBar">
          <span style="font-size:11px;color:var(--c);white-space:nowrap">&#9654; Speaking</span>
          <div class="tts-audio-progress"><div class="tts-audio-fill" id="ttsProgress"></div></div>
          <audio id="ttsAudio" style="display:none"></audio>
        </div>
        <div class="voice-commands">
          <div class="voice-cmd" onclick="voiceQuick('Search for latest AI news')"><div class="voice-cmd-text">"Search for latest AI news"</div><div class="voice-cmd-agent">&#8594; Research Agent</div></div>
          <div class="voice-cmd" onclick="voiceQuick('Write a Python function')"><div class="voice-cmd-text">"Write a Python function"</div><div class="voice-cmd-agent">&#8594; Coding Agent</div></div>
          <div class="voice-cmd" onclick="voiceQuick('What did we discuss before?')"><div class="voice-cmd-text">"What did we discuss before?"</div><div class="voice-cmd-agent">&#8594; Memory Agent</div></div>
          <div class="voice-cmd" onclick="voiceQuick('Explain machine learning simply')"><div class="voice-cmd-text">"Explain machine learning"</div><div class="voice-cmd-agent">&#8594; Productivity Agent</div></div>
        </div>
      </div>
    </div>

  </main>

  <!-- RIGHT PANEL -->
  <aside class="rp">
    <div class="rp-sec" style="flex:1.3">
      <div class="rp-head"><span class="rp-title">AI Activity</span><span class="rp-badge" id="cnt">12 events</span></div>
      <div class="tl" id="tl"></div>
    </div>
    <div class="rp-sec">
      <div class="rp-head"><span class="rp-title">Intelligence</span></div>
      <div class="metrics-grid">
        <div class="met-card"><div class="met-icon">&#9989;</div><div class="met-val" id="m1">0</div><div class="met-lbl">Tasks Done</div><div class="met-trend" style="color:#10B981">&#8593; 12 today</div></div>
        <div class="met-card"><div class="met-icon">&#128172;</div><div class="met-val" id="m2">0</div><div class="met-lbl">Chats</div><div class="met-trend" style="color:#00E5FF">&#8593; 5 today</div></div>
        <div class="met-card"><div class="met-icon">&#129504;</div><div class="met-val" id="m3">0</div><div class="met-lbl">Memories</div><div class="met-trend" style="color:#8B5CF6">+48 new</div></div>
        <div class="met-card"><div class="met-icon">&#9889;</div><div class="met-val" id="m4">0</div><div class="met-lbl">Workflows</div><div class="met-trend" style="color:#EC4899">&#8593; 3 today</div></div>
        <div class="met-card" style="grid-column:1/-1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><div class="met-icon">&#129309;</div><div class="met-val" id="m5">0</div><div class="met-lbl">Collaborations</div></div>
            <div style="display:flex;align-items:flex-end;gap:3px;height:30px">
              <div style="width:5px;background:rgba(0,229,255,.2);border-radius:2px;height:25%"></div>
              <div style="width:5px;background:rgba(0,229,255,.35);border-radius:2px;height:45%"></div>
              <div style="width:5px;background:rgba(0,229,255,.5);border-radius:2px;height:65%"></div>
              <div style="width:5px;background:rgba(0,229,255,.65);border-radius:2px;height:50%"></div>
              <div style="width:5px;background:rgba(0,229,255,.8);border-radius:2px;height:85%"></div>
              <div style="width:5px;background:#00E5FF;border-radius:2px;height:100%;box-shadow:0 0 8px #00E5FF"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</div>
"""

PART2 = r"""
<script>
// ============================================================
// NEURAL BACKGROUND
// ============================================================
const nc=document.getElementById('nbg'),nx=nc.getContext('2d');
let nd=[],NW,NH;
function rsz(){NW=nc.width=window.innerWidth;NH=nc.height=window.innerHeight}
function mkn(c){nd=[];for(let i=0;i<c;i++)nd.push({x:Math.random()*NW,y:Math.random()*NH,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.6+.7,ph:Math.random()*6.28})}
function drn(){nx.clearRect(0,0,NW,NH);const D=170;nd.forEach((a,i)=>{a.x+=a.vx;a.y+=a.vy;a.ph+=.02;if(a.x<0||a.x>NW)a.vx*=-1;if(a.y<0||a.y>NH)a.vy*=-1;const al=(Math.sin(a.ph)*.3+.7)*.6;nd.slice(i+1).forEach(b=>{const dx=a.x-b.x,dy=a.y-b.y,ds=Math.sqrt(dx*dx+dy*dy);if(ds<D){const f=(1-ds/D)*.1;nx.beginPath();nx.moveTo(a.x,a.y);nx.lineTo(b.x,b.y);nx.strokeStyle='rgba(0,229,255,'+f+')';nx.lineWidth=.5;nx.stroke()}});nx.beginPath();nx.arc(a.x,a.y,a.r,0,6.28);nx.fillStyle='rgba(0,229,255,'+(al*.45)+')';nx.fill()})}
// ORB
const oc=document.getElementById('oc'),ox=oc.getContext('2d');
let op=0,orbSt='idle';
function dro(){const W=230,H=230,cx=115,cy=115;ox.clearRect(0,0,W,H);op+=.013;const bl=orbSt==='thinking'?.1:.06,br=1+Math.sin(op)*bl,R=78*br;for(let i=4;i>=0;i--){const r=R+i*15,a=(5-i)*.015,g=ox.createRadialGradient(cx,cy,R*.3,cx,cy,r);g.addColorStop(0,'rgba(0,229,255,'+a+')');g.addColorStop(.5,'rgba(139,92,246,'+(a*.5)+')');g.addColorStop(1,'rgba(0,0,0,0)');ox.beginPath();ox.arc(cx,cy,r,0,6.28);ox.fillStyle=g;ox.fill()}
const sg=ox.createRadialGradient(cx-R*.28,cy-R*.28,R*.05,cx,cy,R);
if(orbSt==='thinking'){sg.addColorStop(0,'rgba(220,180,255,.9)');sg.addColorStop(.25,'rgba(139,92,246,.85)');sg.addColorStop(.6,'rgba(0,229,255,.5)');sg.addColorStop(1,'rgba(0,0,0,0)')}
else if(orbSt==='speaking'){sg.addColorStop(0,'rgba(180,255,220,.9)');sg.addColorStop(.25,'rgba(16,185,129,.85)');sg.addColorStop(.6,'rgba(0,229,255,.5)');sg.addColorStop(1,'rgba(0,0,0,0)')}
else{sg.addColorStop(0,'rgba(180,255,255,.9)');sg.addColorStop(.25,'rgba(0,229,255,.85)');sg.addColorStop(.6,'rgba(139,92,246,.6)');sg.addColorStop(1,'rgba(0,0,0,0)')}
ox.beginPath();ox.arc(cx,cy,R,0,6.28);ox.fillStyle=sg;ox.fill();
const cg=ox.createRadialGradient(cx-R*.2,cy-R*.2,0,cx,cy,R*.5);cg.addColorStop(0,'rgba(255,255,255,.85)');cg.addColorStop(.4,'rgba(200,255,255,.35)');cg.addColorStop(1,'rgba(0,229,255,0)');ox.beginPath();ox.arc(cx,cy,R*.5,0,6.28);ox.fillStyle=cg;ox.fill();
ox.save();ox.translate(cx,cy);ox.rotate(op*.4);ox.scale(1,.25);ox.beginPath();ox.arc(0,0,R*1.15,0,6.28);ox.strokeStyle='rgba(0,229,255,.3)';ox.lineWidth=1.5;ox.stroke();ox.restore();
ox.save();ox.translate(cx,cy);ox.rotate(-op*.3+1.2);ox.scale(.35,1);ox.beginPath();ox.arc(0,0,R*1.2,0,6.28);ox.strokeStyle='rgba(139,92,246,.22)';ox.lineWidth=1;ox.stroke();ox.restore();
for(let i=0;i<6;i++){const ang=op*1.1+i*1.047,d=R*(1.04+Math.sin(op*2+i)*.07),sx=cx+Math.cos(ang)*d,sy=cy+Math.sin(ang)*d,sr=1.5+Math.sin(op*3+i)*.8;ox.beginPath();ox.arc(sx,sy,sr,0,6.28);ox.fillStyle=i%2?'rgba(139,92,246,.9)':'rgba(0,229,255,.9)';ox.fill()}
const wa=orbSt!=='idle'?7:3;ox.beginPath();for(let i=0;i<=64;i++){const a=i/64*6.28,w=Math.sin(a*8+op*4)*wa+Math.sin(a*3+op*2)*(wa*.5),r=R*1.26+w,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?ox.lineTo(x,y):ox.moveTo(x,y)}ox.closePath();ox.strokeStyle='rgba(0,229,255,.15)';ox.lineWidth=1;ox.stroke()}
// PARTICLES
function mkp(){const c=document.getElementById('ptx'),cs=['#00E5FF','#8B5CF6','#10B981','#EC4899','#F59E0B'];for(let i=0;i<18;i++){const p=document.createElement('div'),sz=Math.random()*2.5+.8,cl=cs[~~(Math.random()*5)],du=Math.random()*16+10,dl=Math.random()*16;p.className='pt';p.style.cssText='width:'+sz+'px;height:'+sz+'px;background:'+cl+';left:'+Math.random()*100+'%;box-shadow:0 0 '+(sz*3)+'px '+cl+';animation-duration:'+du+'s;animation-delay:'+dl+'s;opacity:0';c.appendChild(p)}}
// STATUS
const STS=[{t:'Listening',c:'#00E5FF'},{t:'Thinking',c:'#8B5CF6'},{t:'Reasoning',c:'#EC4899'},{t:'Executing',c:'#10B981'},{t:'Online',c:'#00E5FF'}];
let si=0;
function cyc(){si=(si+1)%STS.length;setSt(STS[si].t,STS[si].c)}
function setSt(t,c){const p=document.getElementById('spill'),d=document.getElementById('sdot'),x=document.getElementById('stxt');if(!p)return;x.textContent=t;d.style.background=c;d.style.boxShadow='0 0 6px '+c;p.style.borderColor=c+'40';p.style.color=c}
setInterval(cyc,3500);
// TIMELINE
const EV=[{c:'#00E5FF',t:'Research Agent activated',d:'Analyzing quantum computing trends',tm:'just now'},{c:'#10B981',t:'Memory updated',d:'Stored 12 new knowledge chunks',tm:'1m ago'},{c:'#8B5CF6',t:'Workflow completed',d:'Email summarization -- 47 items',tm:'3m ago'},{c:'#EC4899',t:'Vision Agent analyzed',d:'Processed 3 documents via OCR',tm:'5m ago'},{c:'#F59E0B',t:'Coding Agent deployed',d:'Generated REST API boilerplate',tm:'8m ago'},{c:'#00E5FF',t:'Tool: web_search',d:'Query: AI trends 2025',tm:'11m ago'},{c:'#10B981',t:'Knowledge indexed',d:'1024 vectors stored to memory',tm:'15m ago'},{c:'#8B5CF6',t:'Agent collaboration',d:'Research + Memory sync done',tm:'20m ago'},{c:'#EC4899',t:'Voice command processed',d:'TTS response generated',tm:'25m ago'},{c:'#00E5FF',t:'Automation ran',d:'Browser: filled 3 forms',tm:'32m ago'},{c:'#F59E0B',t:'Task queue processed',d:'8 pending tasks done',tm:'1h ago'},{c:'#10B981',t:'System health check',d:'All 6 agents -- latency 42ms',tm:'1h ago'}];
function bld(){const el=document.getElementById('tl');el.innerHTML='';EV.forEach((e,i)=>{const it=document.createElement('div');it.className='tl-item';it.innerHTML='<div class="tl-line"><div class="tl-dot" style="background:'+e.c+';box-shadow:0 0 7px '+e.c+'"></div>'+(i<EV.length-1?'<div class="tl-bar" style="background:'+e.c+'"></div>':'')+'</div><div class="tl-body"><div class="tl-t">'+e.t+'</div><div class="tl-d">'+e.d+'</div><div class="tl-m">'+e.tm+'</div></div>';el.appendChild(it)})}
function ale(t,d){EV.unshift({c:'#00E5FF',t:t||'System event',d:d||'',tm:'just now'});if(EV.length>14)EV.pop();bld();document.getElementById('cnt').textContent=EV.length+' events'}
setInterval(function(){const es=[{t:'Memory retrieval',d:'Found relevant context chunks'},{t:'Reasoning chain',d:'Multi-step planning initiated'},{t:'Task completed',d:'Code review -- 0 issues found'},{t:'Web search',d:'Crawled 5 sources in 1.2s'}];const e=es[~~(Math.random()*4)];ale(e.t,e.d)},8000);
function amc(id,tg){const el=document.getElementById(id);if(!el)return;let cu=0;const sp=tg/60,ti=setInterval(function(){cu+=sp;if(cu>=tg){cu=tg;clearInterval(ti)}el.textContent=cu>=1000?(cu/1000).toFixed(1)+'K':~~cu},16)}
// ============================================================
// VIEW SYSTEM
// ============================================================
function go(v,el){
  document.querySelectorAll('.ni').forEach(function(n){n.classList.remove('act')});
  if(el)el.classList.add('act');
  document.querySelectorAll('.view').forEach(function(vw){vw.classList.remove('active')});
  const t=document.getElementById('view-'+v);if(t)t.classList.add('active');
  if(v==='dash')closeChat();
  if(v==='agents')loadAgents();
  if(v==='memory')loadMemory();
  if(v==='voice')initVoiceView();
}
// ============================================================
// CHAT
// ============================================================
let chatOpen=false,chatBusy=false,sessId=null,msgN=0;
const AC={research:'#00E5FF',coding:'#10B981',automation:'#8B5CF6',productivity:'#a855f7',vision:'#EC4899',memory:'#F59E0B'};
const AN={research:'Research Agent',coding:'Coding Agent',automation:'Automation Agent',productivity:'Productivity Agent',vision:'Vision Agent',memory:'Memory Agent'};
function openChat(){chatOpen=true;document.getElementById('chatPanel').classList.add('open');document.getElementById('agnet').style.display='none';setTimeout(function(){document.getElementById('chatIn').focus();if(!document.getElementById('chatMsgs').children.length)initMsg()},450);chkProv()}
function closeChat(){chatOpen=false;document.getElementById('chatPanel').classList.remove('open');document.getElementById('agnet').style.display='flex'}
function sendPB(){const v=document.getElementById('pi').value.trim();if(!v)return;document.getElementById('pi').value='';openChat();setTimeout(function(){doSend(v)},500)}
function askQ(q){const dn=document.querySelector('.ni[data-t="Dashboard"]');go('dash',dn);openChat();setTimeout(function(){doSend(q)},500)}
async function chkProv(){try{const r=await fetch('http://localhost:8000/api/system/provider',{signal:AbortSignal.timeout(3000)});const d=await r.json();const b=document.getElementById('provBadge');b.textContent=d.name||'Demo';if(d.live){b.style.color='#10B981';document.getElementById('chatSub').textContent='6 agents online - '+d.model}else{b.style.color='#F59E0B';b.textContent='Demo Mode'}}catch(e){}}
function rnd(t){
  t=t.replace(/```(\w*)\n?([\s\S]*?)```/g,function(_,l,c){const id='cb'+Math.random().toString(36).slice(2,7);return '<div class="code-block"><div class="code-header"><span class="code-lang">'+(l||'code')+'</span><button class="code-copy" onclick="cpC(\''+id+'\')">copy</button></div><div class="code-body" id="'+id+'">'+c.replace(/</g,'&lt;').replace(/>/g,'&gt;').trim()+'</div></div>'});
  t=t.replace(/`([^`]+)`/g,'<code style="background:rgba(255,255,255,.07);padding:1px 6px;border-radius:5px;font-family:monospace;font-size:11px">$1</code>');
  t=t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
  t=t.replace(/^[\-\*] (.*)/gm,'<div style="display:flex;gap:8px;margin:2px 0"><span style="color:#00E5FF;flex-shrink:0">&#8226;</span><span>$1</span></div>');
  t=t.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
  return t;
}
function cpC(id){const el=document.getElementById(id);if(el){navigator.clipboard.writeText(el.textContent).catch(function(){});const b=el.parentElement.querySelector('.code-copy');b.textContent='copied!';b.style.color='#10B981';setTimeout(function(){b.textContent='copy';b.style.color=''},1500)}}
function addMsg(role,content,at,ms){msgN++;const isU=role==='user',ac=AC[at]||'#00E5FF',an=AN[at]||'BURNO AI',d=document.createElement('div');d.className='msg '+(isU?'user':'ai');d.id='m'+msgN;
const ttsBtn=!isU?'<button class="tts-btn" onclick="speakText(this,\''+msgN+'\')" title="Listen">&#9654;</button>':'';
d.innerHTML='<div class="msg-av">'+(isU?'&#128100;':'&#129504;')+'</div><div class="msg-body"><div class="msg-agent" style="color:'+(isU?'rgba(59,130,246,.9)':ac)+'">'+(isU?'You':an)+'</div><div class="msg-bubble" id="mb'+msgN+'">'+(isU?content.replace(/</g,'&lt;'):rnd(content))+'</div><div class="msg-meta" id="mm'+msgN+'"><span>'+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'</span>'+(ms?'<span class="msg-badge">'+ms+'ms</span>':'')+(at&&!isU?'<span class="msg-badge" style="border-color:'+ac+'40;color:'+ac+'">'+at+'</span>':'')+ttsBtn+'</div></div>';
const el=document.getElementById('chatMsgs');el.appendChild(d);el.scrollTop=el.scrollHeight;return msgN}
function addTh(){const d=document.createElement('div');d.className='msg ai';d.id='th';d.innerHTML='<div class="msg-av">&#129504;</div><div class="msg-body"><div class="msg-agent" style="color:#00E5FF">BURNO AI</div><div class="thinking"><div class="td"></div><div class="td"></div><div class="td"></div><span style="font-size:10px;color:var(--m);margin-left:4px">Thinking...</span></div></div>';const el=document.getElementById('chatMsgs');el.appendChild(d);el.scrollTop=el.scrollHeight}
function rmTh(){const t=document.getElementById('th');if(t)t.remove()}
function initMsg(){addMsg('ai','Hello! I am **BURNO AI** - your Personal Intelligence Engine.\n\nI have **6 specialized agents** ready:\n- **Research** - web research, fact-checking\n- **Coding** - code generation, debugging\n- **Automation** - browser control, workflows\n- **Productivity** - tasks, scheduling\n- **Vision** - screen & image analysis\n- **Memory** - context recall, knowledge\n\nAsk me anything, or try Voice mode!','productivity',null)}
async function doSend(msg){if(chatBusy||!msg.trim())return;chatBusy=true;document.getElementById('chatSend').disabled=true;orbSt='thinking';setSt('Processing','#8B5CF6');addMsg('user',msg);addTh();ale('BURNO processing',msg.substring(0,50)+(msg.length>50?'...':''));const t0=Date.now();
try{const res=await fetch('http://localhost:8000/api/chat/stream',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,session_id:sessId||undefined}),signal:AbortSignal.timeout(60000)});
if(!res.ok||!res.body)throw new Error('no stream');
rmTh();msgN++;const bn='mb'+msgN,mn='mm'+msgN,bDiv=document.createElement('div');bDiv.className='msg ai';bDiv.id='m'+msgN;bDiv.innerHTML='<div class="msg-av">&#129504;</div><div class="msg-body"><div class="msg-agent" style="color:#00E5FF">BURNO AI</div><div class="msg-bubble" id="'+bn+'"><span id="cur" style="display:inline-block;width:2px;height:13px;background:#00E5FF;border-radius:2px;vertical-align:middle;animation:pd .5s infinite"></span></div><div class="msg-meta" id="'+mn+'"></div></div>';
const el=document.getElementById('chatMsgs');el.appendChild(bDiv);const bEl=document.getElementById(bn),mEl=document.getElementById(mn),cEl=document.getElementById('cur');let buf='',acc='',at='productivity';const rdr=res.body.getReader(),dec=new TextDecoder();
while(true){const {done,value}=await rdr.read();if(done)break;buf+=dec.decode(value,{stream:true});const ls=buf.split('\n');buf=ls.pop()||'';for(const l of ls){if(!l.startsWith('data: '))continue;try{const ev=JSON.parse(l.slice(6));if(ev.token!==undefined){acc+=ev.token;bEl.innerHTML=rnd(acc);bEl.appendChild(cEl);el.scrollTop=el.scrollHeight}if(ev.done){sessId=ev.session_id;at=ev.agent_type||'productivity';if(cEl.parentNode)cEl.remove();const ms=Date.now()-t0,ac2=AC[at]||'#00E5FF';const cMsgN=msgN;mEl.innerHTML='<span>'+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'</span><span class="msg-badge">'+ms+'ms</span><span class="msg-badge" style="border-color:'+ac2+'40;color:'+ac2+'">'+at+'</span><button class="tts-btn" onclick="speakText(this,\''+cMsgN+'\')" title="Listen">&#9654;</button>';ale((AN[at]||'BURNO')+' responded',acc.substring(0,55)+'...');updateMemoryCount()}if(ev.error){bEl.textContent='Error: '+ev.error}}catch(e){}}}
}catch(err){try{const r=await fetch('http://localhost:8000/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,session_id:sessId||undefined}),signal:AbortSignal.timeout(30000)});const d=await r.json();sessId=d.session_id;rmTh();addMsg('ai',d.content,d.agent_type,Date.now()-t0);ale((d.agent_name||'BURNO')+' responded',d.content.substring(0,55)+'...')}catch(fe){rmTh();addMsg('ai','Cannot reach the backend server. Make sure it is running on port 8000.\n\n**Run:** `.\\venv\\Scripts\\python.exe -m uvicorn main:app --port 8000` in the backend folder','productivity',null)}}
finally{chatBusy=false;document.getElementById('chatSend').disabled=false;orbSt='idle';setSt('Online','#00E5FF')}}
function sendChat(){const v=document.getElementById('chatIn').value.trim();if(!v||chatBusy)return;document.getElementById('chatIn').value='';document.getElementById('chatIn').style.height='auto';doSend(v)}
// ============================================================
// ELEVENLABS TTS
// ============================================================
let ttsPlaying=false;
async function speakText(btn,msgId){
  if(ttsPlaying){stopTTS(btn);return}
  const bubbleEl=document.getElementById('mb'+msgId);
  if(!bubbleEl)return;
  // Get plain text from bubble
  const text=bubbleEl.innerText.trim().substring(0,800);
  if(!text)return;
  try{
    btn.classList.add('playing');btn.textContent='&#9646;&#9646;';ttsPlaying=true;
    const r=await fetch('http://localhost:8000/api/voice/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text}),signal:AbortSignal.timeout(30000)});
    if(!r.ok){const e=await r.json();console.warn('TTS error:',e.detail);btn.classList.remove('playing');btn.innerHTML='&#9654;';ttsPlaying=false;return}
    const blob=await r.blob();
    const url=URL.createObjectURL(blob);
    const audio=document.getElementById('ttsAudio')||new Audio();
    audio.src=url;
    audio.play();
    orbSt='speaking';setSt('Speaking','#10B981');
    audio.onended=function(){btn.classList.remove('playing');btn.innerHTML='&#9654;';ttsPlaying=false;orbSt='idle';setSt('Online','#00E5FF');URL.revokeObjectURL(url)};
  }catch(e){btn.classList.remove('playing');btn.innerHTML='&#9654;';ttsPlaying=false;console.warn('TTS unavailable:',e.message)}
}
function stopTTS(btn){const a=document.getElementById('ttsAudio');if(a){a.pause();a.currentTime=0}ttsPlaying=false;if(btn){btn.classList.remove('playing');btn.innerHTML='&#9654;'}orbSt='idle';setSt('Online','#00E5FF')}
// ============================================================
// AGENTS
// ============================================================
let agentData=[],modalAgent=null;
async function loadAgents(){
  const grid=document.getElementById('agentsGrid');
  grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--m)">Loading...</div>';
  try{
    const r=await fetch('http://localhost:8000/api/agents',{signal:AbortSignal.timeout(6000)});
    const d=await r.json();
    agentData=d.agents||[];
    document.getElementById('agStat1').textContent=d.active||0;
    document.getElementById('agStat2').textContent=d.standby||0;
    const tot=agentData.reduce(function(s,a){return s+(a.tasks_completed||0)},0);
    document.getElementById('agStat3').textContent=tot>999?Math.floor(tot/1000)+'K':tot;
    const avg=(agentData.reduce(function(s,a){return s+(a.success_rate||0)},0)/Math.max(agentData.length,1)).toFixed(1);
    document.getElementById('agStat4').textContent=avg+'%';
    renderAgents(agentData);
  }catch(e){document.getElementById('agentsGrid').innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:rgba(239,68,68,.7)">Could not load agents. Backend may be offline.</div>'}
}
function renderAgents(agents){
  const grid=document.getElementById('agentsGrid');grid.innerHTML='';
  agents.forEach(function(a){
    const card=document.createElement('div');card.className='agent-card';
    card.style.borderColor='rgba('+h2r(a.color)+',0.12)';
    const sc=a.status==='active'?'active':a.status==='processing'?'processing':'standby';
    const caps=(a.capabilities||[]).slice(0,4).map(function(c){return '<span class="cap">'+c+'</span>'}).join('');
    const sr=a.success_rate||0;
    card.innerHTML='<div class="acf-top"><div class="acf-icon" style="background:rgba('+h2r(a.color)+',.07);border-color:rgba('+h2r(a.color)+',.18)">'+a.icon+'</div><div class="status-badge '+sc+'">'+a.status+'</div></div><div class="acf-name">'+a.name+'</div><div class="acf-desc">'+a.description+'</div><div class="caps">'+caps+'</div><div class="metrics-row"><div class="metric-box"><div class="metric-val" style="color:'+a.color+'">'+a.tasks_completed+'</div><div class="metric-lbl">Tasks</div></div><div class="metric-box"><div class="metric-val" style="color:'+a.color+'">'+Math.round((a.avg_response_ms||0)/100)/10+'s</div><div class="metric-lbl">Avg</div></div><div class="metric-box"><div class="metric-val" style="color:'+a.color+'">'+sr.toFixed(0)+'%</div><div class="metric-lbl">Rate</div></div></div><div class="prog-wrap"><div class="prog-bar" style="width:'+sr+'%;background:linear-gradient(90deg,'+a.color+','+a.color+'88)"></div></div><div class="agent-actions"><button class="btn btn-primary btn-sm" onclick="openModal(\''+a.type+'\')">&#9654; Task</button>'+(a.status==='active'?'<button class="btn btn-danger btn-sm" onclick="toggleAgent(\''+a.type+'\',\'pause\')">&#9646;&#9646; Pause</button>':'<button class="btn btn-ghost btn-sm" onclick="toggleAgent(\''+a.type+'\',\'activate\')">&#9654; Activate</button>')+'<button class="btn btn-ghost btn-sm" onclick="askQ(\'Tell me about the '+a.name+'\')">Chat</button></div>';
    grid.appendChild(card);
  });
}
function h2r(hex){hex=hex.replace('#','');const n=parseInt(hex,16);return((n>>16)&255)+','+((n>>8)&255)+','+((n&255))}
async function toggleAgent(type,action){
  try{await fetch('http://localhost:8000/api/agents/'+type+'/'+action,{method:'POST',signal:AbortSignal.timeout(5000)});ale(type+' agent '+(action==='activate'?'activated':'paused'),'');loadAgents()}catch(e){}
}
function openModal(agentType){modalAgent=agentType;const a=agentData.find(function(x){return x.type===agentType});document.getElementById('modalTitle').textContent=(a?a.icon+' '+a.name:'Agent')+' Task';document.getElementById('modalInput').value='';document.getElementById('modalResult').className='modal-result';document.getElementById('taskOverlay').classList.add('open');setTimeout(function(){document.getElementById('modalInput').focus()},100)}
function closeModal(){document.getElementById('taskOverlay').classList.remove('open');modalAgent=null}
async function submitTask(){
  const msg=document.getElementById('modalInput').value.trim();if(!msg||!modalAgent)return;
  const btn=document.querySelector('#taskOverlay .btn-primary'),rEl=document.getElementById('modalResult');
  btn.textContent='Running...';btn.disabled=true;rEl.className='modal-result show';rEl.innerHTML='<div style="display:flex;gap:6px;align-items:center;color:var(--m)"><div class="td"></div><div class="td"></div><div class="td"></div><span style="font-size:10px;margin-left:4px">Processing...</span></div>';
  try{const r=await fetch('http://localhost:8000/api/agents/'+modalAgent+'/task',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg}),signal:AbortSignal.timeout(45000)});const d=await r.json();if(d.success){rEl.innerHTML='<div style="color:#10B981;font-size:10px;font-weight:600;margin-bottom:8px">&#9989; Completed</div><div style="font-size:12px;line-height:1.7">'+rnd(d.result||'')+'</div>';ale((d.agent_name||'Agent')+' task done',msg.substring(0,50));loadAgents()}else{rEl.innerHTML='<div style="color:#ef4444;font-size:11px">Error: '+(d.detail||'failed')+'</div>'}}catch(fe){rEl.innerHTML='<div style="color:#ef4444;font-size:11px">Connection error.</div>'}
  btn.textContent='&#9654; Run Task';btn.disabled=false;
}
document.getElementById('modalInput').addEventListener('keydown',function(e){if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))submitTask()});
// ============================================================
// MEMORY PANEL
// ============================================================
let memCat='all',memSearchTimer=null;
async function loadMemory(){
  await Promise.all([loadMemoryStats(),loadMemoryList()]);
}
async function loadMemoryStats(){
  try{
    const r=await fetch('http://localhost:8000/api/memory/stats',{signal:AbortSignal.timeout(5000)});
    const d=await r.json();
    document.getElementById('memTotal').textContent=d.total||0;
    document.getElementById('memConv').textContent=(d.categories||{}).conversation||0;
    document.getElementById('memKnow').textContent=(d.categories||{}).knowledge||0;
    document.getElementById('memTask').textContent=(d.categories||{}).task||0;
  }catch(e){}
}
async function loadMemoryList(){
  const listEl=document.getElementById('memList');
  listEl.innerHTML='<div class="mem-empty">Loading...</div>';
  const q=document.getElementById('memSearch').value.trim();
  try{
    let url,r,d;
    if(q){
      url='http://localhost:8000/api/memory/search?query='+encodeURIComponent(q)+'&limit=30';
      r=await fetch(url,{signal:AbortSignal.timeout(6000)});d=await r.json();
      renderMemories(d.results||[]);
    }else{
      url='http://localhost:8000/api/memory/list?limit=50&category='+memCat;
      r=await fetch(url,{signal:AbortSignal.timeout(6000)});d=await r.json();
      renderMemories(d.memories||[]);
    }
  }catch(e){listEl.innerHTML='<div class="mem-empty">Could not load memories. Backend may be offline.</div>'}
}
function renderMemories(mems){
  const listEl=document.getElementById('memList');
  if(!mems.length){listEl.innerHTML='<div class="mem-empty">&#129504; No memories found.<br><br>Store your first memory using the panel above, or have a conversation with BURNO.</div>';return}
  const catColors={conversation:'#00E5FF',knowledge:'#10B981',task:'#F59E0B',note:'#8B5CF6',preference:'#EC4899'};
  listEl.innerHTML='';
  mems.forEach(function(m){
    const card=document.createElement('div');card.className='mem-card';
    const cc=catColors[m.category]||'#00E5FF';
    const tags=(m.tags||[]).map(function(t){return '<span class="mem-tag">'+t+'</span>'}).join('');
    const dt=m.created_at?new Date(m.created_at).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';
    card.innerHTML='<div class="mem-card-top"><div class="mem-content">'+m.content.replace(/</g,'&lt;')+'</div><div class="mem-actions"><button class="btn btn-ghost btn-sm" onclick="askQ(\'Tell me more about: '+m.content.substring(0,60).replace(/'/g,'')+'\')" title="Ask AI about this">&#128172;</button><button class="btn btn-danger btn-sm" onclick="deleteMemory(\''+m.id+'\',this)" title="Delete">&#128465;</button></div></div><div class="mem-meta"><span class="mem-cat" style="background:rgba('+h2r(cc)+',.08);border:1px solid rgba('+h2r(cc)+',.2);color:'+cc+'">'+m.category+'</span>'+tags+'<span class="mem-time">'+dt+'</span></div>';
    listEl.appendChild(card);
  });
}
function filterCat(cat,btn){memCat=cat;document.querySelectorAll('.cat-btn').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');loadMemoryList()}
function debounceSearch(){clearTimeout(memSearchTimer);memSearchTimer=setTimeout(loadMemoryList,350)}
async function saveMemory(){
  const content=document.getElementById('memNewContent').value.trim();
  const category=document.getElementById('memNewCat').value;
  if(!content){document.getElementById('memNewContent').focus();return}
  const btn=document.querySelector('.mem-add-panel .btn-primary');btn.textContent='Saving...';btn.disabled=true;
  try{
    const r=await fetch('http://localhost:8000/api/memory/store',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:content,category:category}),signal:AbortSignal.timeout(10000)});
    const d=await r.json();
    if(d.stored){document.getElementById('memNewContent').value='';ale('Memory stored','New '+category+' memory saved');loadMemory();updateMemoryCount()}
  }catch(e){alert('Could not save memory. Check backend connection.')}
  btn.textContent='&#128190; Save';btn.disabled=false;
}
async function deleteMemory(id,btn){
  if(!confirm('Delete this memory?'))return;
  btn.textContent='...';btn.disabled=true;
  try{
    await fetch('http://localhost:8000/api/memory/'+id,{method:'DELETE',signal:AbortSignal.timeout(5000)});
    ale('Memory deleted','Removed from memory bank');loadMemory();updateMemoryCount();
  }catch(e){btn.textContent='&#128465;';btn.disabled=false}
}
async function updateMemoryCount(){try{const r=await fetch('http://localhost:8000/api/memory/stats',{signal:AbortSignal.timeout(3000)});const d=await r.json();document.getElementById('m3').textContent=d.total>999?(d.total/1000).toFixed(1)+'K':d.total}catch(e){}}
// ============================================================
// VOICE ASSISTANT
// ============================================================
let voiceRec=null,voiceActive=false,waveInterval=null;
function initVoiceView(){checkTTS()}
async function checkTTS(){try{const r=await fetch('http://localhost:8000/api/voice/status',{signal:AbortSignal.timeout(4000)});const d=await r.json();const vs=document.getElementById('voiceStatus');if(d.configured){vs.textContent='Click orb to speak — ElevenLabs TTS ready'}else{vs.textContent='Click to speak (TTS not configured — add ELEVENLABS_API_KEY)'}}catch(e){}}
function toggleVoice(){voiceActive?stopVoice():startVoice()}
function startVoice(){
  if(!('webkitSpeechRecognition'in window)&&!('SpeechRecognition'in window)){alert('Voice input requires Chrome browser.');return}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;voiceRec=new SR();voiceRec.lang='en-US';voiceRec.continuous=false;voiceRec.interimResults=true;voiceActive=true;
  const orb=document.getElementById('voiceOrb'),vs=document.getElementById('voiceStatus'),vt=document.getElementById('voiceTranscript');
  orb.className='voice-orb listening';orb.textContent='&#127897;';vs.textContent='Listening...';vt.textContent='Speak now...';orbSt='thinking';setSt('Listening','#00E5FF');animateWave(true);
  voiceRec.onresult=function(e){let fin='',int='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)fin+=e.results[i][0].transcript;else int+=e.results[i][0].transcript}vt.textContent=(fin||int)||'...'};
  voiceRec.onend=function(){
    const text=vt.textContent;voiceActive=false;orb.className='voice-orb';orb.textContent='&#127897;';animateWave(false);
    if(text&&text!=='Speak now...'&&text!=='Your speech will appear here...'){
      vs.textContent='Processing: "'+text.substring(0,40)+(text.length>40?'...':'')+'"';
      sendVoiceMessage(text);
    }else{vs.textContent='Click orb to speak';setSt('Online','#00E5FF');orbSt='idle'}
  };
  voiceRec.onerror=function(e){voiceActive=false;orb.className='voice-orb';orb.textContent='&#127897;';vs.textContent='Error: '+e.error+'. Try again.';animateWave(false);orbSt='idle';setSt('Online','#00E5FF')};
  voiceRec.start();
}
function stopVoice(){if(voiceRec)voiceRec.stop();voiceActive=false;animateWave(false)}
function voiceQuick(text){document.getElementById('voiceTranscript').textContent=text;document.getElementById('voiceStatus').textContent='Processing...';;sendVoiceMessage(text)}
async function sendVoiceMessage(text){
  orbSt='thinking';setSt('Processing','#8B5CF6');
  const vs=document.getElementById('voiceStatus');
  try{
    const r=await fetch('http://localhost:8000/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,session_id:sessId||undefined}),signal:AbortSignal.timeout(30000)});
    const d=await r.json();sessId=d.session_id;const reply=d.content||'';
    vs.textContent='BURNO: "'+reply.substring(0,80)+(reply.length>80?'...':'')+'"';
    ale('Voice: '+(AN[d.agent_type]||'BURNO')+' responded',reply.substring(0,55));
    // Auto-play TTS
    await playTTS(reply.substring(0,800));
  }catch(e){vs.textContent='Could not get response. Check backend.';orbSt='idle';setSt('Online','#00E5FF')}
}
async function playTTS(text){
  const orb=document.getElementById('voiceOrb'),bar=document.getElementById('ttsBar');
  try{
    const r=await fetch('http://localhost:8000/api/voice/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text}),signal:AbortSignal.timeout(30000)});
    if(!r.ok){orbSt='idle';setSt('Online','#00E5FF');return}
    const blob=await r.blob();const url=URL.createObjectURL(blob);
    const audio=document.getElementById('ttsAudio');audio.src=url;
    orb.className='voice-orb speaking';orb.textContent='&#128266;';orbSt='speaking';setSt('Speaking','#10B981');bar.className='tts-audio-bar show';animateWave(true);
    audio.play();
    audio.onended=function(){orb.className='voice-orb';orb.textContent='&#127897;';orbSt='idle';setSt('Online','#00E5FF');bar.className='tts-audio-bar';animateWave(false);URL.revokeObjectURL(url);document.getElementById('voiceStatus').textContent='Click orb to speak'};
  }catch(e){orbSt='idle';setSt('Online','#00E5FF');orb.className='voice-orb';orb.textContent='&#127897;';animateWave(false)}
}
function animateWave(active){
  clearInterval(waveInterval);const bars=document.querySelectorAll('.wave-bar');
  if(active){waveInterval=setInterval(function(){bars.forEach(function(b){b.style.height=Math.random()*36+6+'px';b.style.background='rgba(0,229,255,'+(Math.random()*.5+.4)+')'})},100)}
  else{bars.forEach(function(b,i){b.style.height=[8,14,20,10,28,18,10,22,14,8,18,26,12,8,16][i]+'px';b.style.background='rgba(0,229,255,.4)'})}
}
// ============================================================
// DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('chatIn').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat()}});
  document.getElementById('chatIn').addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,110)+'px'});
  document.getElementById('pi').addEventListener('keydown',function(e){if(e.key==='Enter')sendPB()});
  document.querySelectorAll('.qc,.ac,.met-card').forEach(function(el){
    el.addEventListener('mousemove',function(e){const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform='translate('+(x*.07)+'px,'+(y*.07-2)+'px)'});
    el.addEventListener('mouseleave',function(){el.style.transform=''});
  });
  chkProv();
});
// MAIN LOOP
function loop(){drn();dro();requestAnimationFrame(loop)}
rsz();mkn(65);mkp();bld();loop();
amc('m1',247);amc('m2',84);amc('m3',0);amc('m4',36);amc('m5',1024);
window.addEventListener('resize',function(){rsz();mkn(65)});
// Load memory count on start
setTimeout(updateMemoryCount,1000);
</script>
</body>
</html>
"""

out_path = r"c:\Users\solan\Downloads\My Assistant\frontend\public\burno.html"
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(PART1 + PART2)
print(f"Done: {len(PART1)+len(PART2)} chars written to {out_path}")
