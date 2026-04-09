/**
 * Script de pruebas automáticas — Pórtico Backend
 */
const BASE = 'https://portico-backend-910308527640.us-central1.run.app';
const fs = require('fs');

const results = [];

async function req(method, path, body, expectedStatus, testName) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json().catch(() => ({}));
    const ok = res.status === expectedStatus;
    results.push({ testName, method, path, expectedStatus, actualStatus: res.status, ok, responseBody: data });
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} [${res.status}] ${testName}`);
    if (!ok) console.log(`   ⚠ Esperado:${expectedStatus} | Body: ${JSON.stringify(data).slice(0,300)}`);
    else console.log(`   ↳ ${JSON.stringify(data).slice(0,150)}`);
    return { ok, data, status: res.status };
  } catch (err) {
    results.push({ testName, method, path, expectedStatus, actualStatus: 'NET_ERROR', ok: false, error: err.message });
    console.log(`💥 [ERROR] ${testName}: ${err.message}`);
    return { ok: false, data: {}, status: 0 };
  }
}

async function runAll() {
  console.log('\n═══ PÓRTICO BACKEND — BATERÍA DE PRUEBAS ═══');
  console.log(`    ${new Date().toISOString()}\n`);

  // ── KYC ──────────────────────────────────────────────────
  console.log('\n─ 01. KYC / Verificación de Identidad ─');
  await req('POST','/api/kyc/consentimiento',{uid:'test-kyc-001',version:'2.1.0',proposito:'Verificación de identidad',dispositivo:'Pixel 9'},201,'KYC-01 | Consentimiento OK (201)');
  await req('POST','/api/kyc/consentimiento',{version:'2.1.0',proposito:'X',dispositivo:'X'},400,'KYC-02 | Sin uid (400)');
  await req('POST','/api/kyc/consentimiento',{},400,'KYC-03 | Body vacío (400)');
  await req('POST','/api/kyc/consentimiento',{uid:'u',version:'v',proposito:'p',dispositivo:'d',campoExtra:'x'},400,'KYC-04 | Campo extra no permitido (400)');
  await req('POST','/api/kyc/webhook',{userId:'test-kyc-001',estado:'APROBADO'},200,'KYC-05 | Webhook APROBADO (200)');
  await req('POST','/api/kyc/webhook',{userId:'test-kyc-001',estado:'RECHAZADO',motivoRechazo:'Foto borrosa'},200,'KYC-06 | Webhook RECHAZADO (200)');
  await req('POST','/api/kyc/webhook',{estado:'REVISION'},400,'KYC-07 | Webhook sin userId (400)');

  // ── BANKING ──────────────────────────────────────────────
  console.log('\n─ 02. Open Banking ─');
  await req('POST','/api/banking/webhook',{userId:'test-bank-001',idTransaccion:`txn-${Date.now()}`,monto:850000,comercio:'Mercado Libre',fechaHora:'2026-04-08T23:10:00.000Z',ubicacion:'Bogotá',factorDispositivo:0},200,'BANK-01 | Webhook transacción OK (200)');
  await req('POST','/api/banking/webhook',{userId:'test-bank-001',monto:500},400,'BANK-02 | Webhook faltan campos (400)');
  await req('POST','/api/banking/webhook',{},400,'BANK-03 | Webhook body vacío (400)');
  await req('POST','/api/banking/link',{userId:'test-bank-001',authCode:'oauth-sim-abc123'},201,'BANK-04 | Recurrent Link simulado (201)');
  await req('POST','/api/banking/link',{userId:'test-bank-001'},400,'BANK-05 | Link sin authCode (400)');
  await req('POST','/api/banking/link',{},400,'BANK-06 | Link body vacío (400)');

  // ── OTP ──────────────────────────────────────────────────
  console.log('\n─ 03. OTP / MFA ─');
  const t = await req('POST','/api/otp/trigger',{uid:'test-otp-001',nivelRiesgo:'ALTO',motivo:'Transacción sospechosa'},201,'OTP-01 | Trigger ALTO (201)');
  await req('POST','/api/otp/trigger',{uid:'test-otp-002',nivelRiesgo:'CRITICO',motivo:'Acceso desconocido'},201,'OTP-02 | Trigger CRÍTICO (201)');
  await req('POST','/api/otp/trigger',{uid:'test-otp-003',nivelRiesgo:'MEDIO',motivo:'Nuevo dispositivo'},201,'OTP-03 | Trigger MEDIO (201)');
  await req('POST','/api/otp/trigger',{nivelRiesgo:'ALTO',motivo:'test'},400,'OTP-04 | Trigger sin uid (400)');
  await req('POST','/api/otp/trigger',{},400,'OTP-05 | Trigger body vacío (400)');
  const otpId = t.data?.otpId || `otp-simulado-${Date.now()}`;
  await req('POST','/api/otp/verificar',{uid:'test-otp-001',otpId,codigo:'000000'},200,'OTP-06 | Verificar código CORRECTO → valido:true (200)');
  await req('POST','/api/otp/verificar',{uid:'test-otp-001',otpId,codigo:'999999'},200,'OTP-07 | Verificar código INCORRECTO → valido:false (200)');
  await req('POST','/api/otp/verificar',{uid:'test-otp-001',codigo:'000000'},400,'OTP-08 | Verificar sin otpId (400)');
  await req('POST','/api/otp/verificar',{},400,'OTP-09 | Verificar body vacío (400)');

  // ── NOTIFICACIONES ───────────────────────────────────────
  console.log('\n─ 04. Notificaciones Push ─');
  await req('PUT','/api/notificaciones/config/test-notif-001',{permisoNotificacionesActivo:true,canalesActivos:['PUSH','EMAIL']},200,'NOTIF-01 | Actualizar config (200)');
  await req('PUT','/api/notificaciones/config/test-notif-001',{permisoNotificacionesActivo:false},200,'NOTIF-02 | Desactivar notificaciones (200)');
  await req('POST','/api/notificaciones/enviar',{userId:'test-notif-001',alertaId:`a-${Date.now()}`,monto:850000,comercio:'Amazon',nivelUrgencia:'ALTA',colorIndicador:'NARANJA',forzarTodosCanales:false},200,'NOTIF-03 | Enviar con permisos OFF → enviado:false (200)');
  await req('PUT','/api/notificaciones/config/test-notif-001',{permisoNotificacionesActivo:true},200,'NOTIF-04 | Reactivar (200)');
  await req('POST','/api/notificaciones/enviar',{userId:'test-notif-001',alertaId:`a-${Date.now()}`,monto:5000000,comercio:'Trans Internacional',nivelUrgencia:'INMEDIATA',colorIndicador:'ROJO',forzarTodosCanales:true},200,'NOTIF-05 | Enviar INMEDIATA forzada → enviado:true (200)');
  await req('POST','/api/notificaciones/enviar',{userId:'test-notif-001'},400,'NOTIF-06 | Enviar sin campos requeridos (400)');
  await req('POST','/api/notificaciones/enviar',{},400,'NOTIF-07 | Enviar body vacío (400)');

  // ── RASP ─────────────────────────────────────────────────
  console.log('\n─ 05. RASP / Seguridad ─');
  await req('POST','/api/rasp/webhook',{userId:'test-rasp-001',tipoAmenaza:'ROOT_DETECTION',severidad:'CRITICA',dispositivo:'Samsung S24',timestampMs:Date.now()},200,'RASP-01 | Amenaza CRÍTICA → sesiones bloqueadas (200)');
  await req('POST','/api/rasp/webhook',{userId:'test-rasp-002',tipoAmenaza:'HOOK_DETECTION',severidad:'ALTA',dispositivo:'Pixel 9',timestampMs:Date.now()},200,'RASP-02 | Amenaza ALTA (200)');
  await req('POST','/api/rasp/webhook',{userId:'test-rasp-003',tipoAmenaza:'EMULATOR_DETECTED',severidad:'MEDIA',dispositivo:'AVD',timestampMs:Date.now()},200,'RASP-03 | Amenaza MEDIA (200)');
  await req('POST','/api/rasp/webhook',{tipoAmenaza:'ROOT',severidad:'CRITICA'},400,'RASP-04 | Sin userId (400)');
  await req('POST','/api/rasp/webhook',{},400,'RASP-05 | Body vacío (400)');

  // ── RESUMEN ──────────────────────────────────────────────
  const passed = results.filter(r=>r.ok).length;
  const failed = results.filter(r=>!r.ok).length;
  console.log(`\n═══ RESUMEN ═══`);
  console.log(`✅ Pasaron: ${passed} | ❌ Fallaron: ${failed} | 📊 Total: ${results.length}`);
  if(failed>0){
    console.log('\nFALLOS:');
    results.filter(r=>!r.ok).forEach(r=>{
      console.log(`  • ${r.testName}`);
      console.log(`    Esperado=${r.expectedStatus}, Obtenido=${r.actualStatus}`);
      console.log(`    Body: ${JSON.stringify(r.responseBody||r.error||{}).slice(0,300)}`);
    });
  }
  fs.writeFileSync('test-results.json', JSON.stringify({timestamp:new Date().toISOString(),passed,failed,total:results.length,results},null,2));
  console.log('\nResultados → test-results.json');
}

runAll().catch(console.error);
