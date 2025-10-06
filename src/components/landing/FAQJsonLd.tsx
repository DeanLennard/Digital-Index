// src/components/landing/PageBeacon.client.tsx
export default function FAQJsonLd() {
    const json = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "Is this really free?",
                acceptedAnswer: { "@type": "Answer", text: "Yes. No payment details required." },
            },
            {
                "@type": "Question",
                name: "Do I need to enter payment details?",
                acceptedAnswer: { "@type": "Answer", text: "No card needed to complete your snapshot." },
            },
            {
                "@type": "Question",
                name: "How long does it take?",
                acceptedAnswer: { "@type": "Answer", text: "About 5 minutes (10–15 questions)." },
            },
            {
                "@type": "Question",
                name: "Is my data secure?",
                acceptedAnswer: { "@type": "Answer", text: "Yes. GDPR compliant, UK-based." },
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
        />
    );
}
