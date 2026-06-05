import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bkiumgzykkscycxbpgsp.supabase.co";
const ANON_KEY = "sb_publishable_pzGyJMPwSJkfLeAwJHNNtg_GOJ0CrQQ";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraXVtZ3p5a2tzY3ljeGJwZ3NwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkwNzU1NSwiZXhwIjoyMDk1NDgzNTU1fQ.L9kKOxnXDoHlPpcMI2mKGszQLez6XXQS36TqXKOC_F0";

const anon = createClient(SUPABASE_URL, ANON_KEY);
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkRLS() {
  console.log("=== RLS Verification ===\n");

  // 1. Anon SELECT products (should only see active=true)
  console.log("1. Anon SELECT products (expect some rows if any active):");
  const { data: anonProducts, error: anonProductsErr } = await anon.from("products").select("id, name, active").limit(5);
  console.log(anonProductsErr ? `  ✗ ERROR: ${anonProductsErr.message}` : `  ✓ OK (${anonProducts?.length ?? 0} rows)`);
  if (anonProducts?.length) {
    anonProducts.forEach(p => console.log(`     id=${p.id} name=${p.name} active=${p.active}`));
  }

  // 2. Admin SELECT products (should see all)
  console.log("\n2. Admin SELECT products (expect all rows):");
  const { data: adminProducts, error: adminProductsErr } = await admin.from("products").select("id, name, active").limit(5);
  console.log(adminProductsErr ? `  ✗ ERROR: ${adminProductsErr.message}` : `  ✓ OK (${adminProducts?.length ?? 0} rows)`);

  // 3. Anon INSERT quote_requests (should succeed)
  console.log("\n3. Anon INSERT quote_requests (expect allowed):");
  const { error: anonInsertErr } = await anon.from("quote_requests").insert({
    customer_name: "TEST",
    customer_phone: "5210000000000",
    items: [],
    unique_products: 0,
    desired_total_pieces: 0,
    estimated_subtotal: 0,
    status: "new",
  });
  if (anonInsertErr) {
    console.log(`  ✗ REJECTED: ${anonInsertErr.message}`);
    if (anonInsertErr.message.includes("violates row-level security")) {
      console.log("  → RLS is blocking anon INSERT - policy needed!");
    }
  } else {
    console.log("  ✓ INSERT allowed");
    // Clean up test record
    await admin.from("quote_requests").delete().eq("customer_name", "TEST");
  }

  // 4. Anon SELECT quote_requests (should be denied)
  console.log("\n4. Anon SELECT quote_requests (expect denied):");
  const { data: anonQuotes, error: anonQuotesErr } = await anon.from("quote_requests").select("id").limit(1);
  if (anonQuotesErr) {
    if (anonQuotesErr.message.includes("violates row-level security") || anonQuotesErr.message.includes("permission denied")) {
      console.log("  ✓ Correctly BLOCKED (RLS prevents anon SELECT)");
    } else {
      console.log(`  ✗ ERROR: ${anonQuotesErr.message}`);
    }
  } else {
    console.log(`  ⚠ ALLOWED (${anonQuotes?.length ?? 0} rows) - RLS might not be enabled!`);
  }

  // 5. Anon UPDATE/DELETE quote_requests (should be denied)
  console.log("\n5. Anon DELETE products (expect denied):");
  const { error: anonDeleteErr } = await anon.from("products").delete().eq("id", 0);
  if (anonDeleteErr && (anonDeleteErr.message.includes("violates row-level security") || anonDeleteErr.message.includes("permission denied"))) {
    console.log("  ✓ Correctly BLOCKED");
  } else if (anonDeleteErr) {
    console.log(`  ? ${anonDeleteErr.message}`);
  } else {
    console.log("  ⚠ ALLOWED - RLS might not be enabled!");
  }

  console.log("\n=== Done ===");
}

checkRLS().catch(console.error);
