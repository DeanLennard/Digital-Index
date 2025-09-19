import puppeteer from 'puppeteer';

export async function renderPdfForSurvey(surveyId: string) {
    const url = `${process.env.NEXTAUTH_URL}/app/reports/pdf/${surveyId}?print=1`;
    const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', right: '12mm', bottom: '14mm', left: '12mm' } });
    await browser.close();
    return pdf;
}