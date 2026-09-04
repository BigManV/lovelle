# Lovelle enquiry form deployment

Add these environment variables in **Vercel > Project > Settings > Environment Variables**:

```text
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbw-hEERgO2TN8cKTQK9Lmjwb6umjyvjzZLW3DdTDGTeBF_OVa1YdzNZp3KESQcX3zso/exec
FORM_SECRET=<the exact value stored in the Apps Script FORM_SECRET property>
```

Apply both variables to Production and Preview. Store `FORM_SECRET` as a Secret, and do not prefix either variable with `PUBLIC_`. Redeploy after adding or changing an environment variable.

The Apps Script deployment must use **Execute as: Me** and **Who has access: Anyone**.

After deployment, submit one enquiry from the website and confirm that a new row appears in the `Enquiries` tab. If it fails, check the Vercel Function logs for `/api/enquiry`, then check **Apps Script > Executions**.
