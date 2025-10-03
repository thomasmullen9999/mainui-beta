import { prisma } from "@/lib/prisma";

interface LeadHistoryResult {
  id: number;
  lead_email: string;
  lead_status: string;
  telphone: string;
  url: number;
  campaign: string;
  dateleft: string;
  lastDelivery: string;
  daysuntilexpiry: number;
  firstname: string;
  lastname: string;
}
const nurtureMorrisons = async () => {
  const data = await prisma.$queryRaw<LeadHistoryResult[]>`
    SELECT 
      lh.id,
      lh.lead_email,
      lh.lead_status,
      "formData"->'telphone'->'value' AS telephone,
      CONCAT('https://claim.fairpayforall.co.uk/m/', lh.lead_id) AS url,
      lh.lead_campaign AS campaign,
      
      "formData"->'dateleft'->'value' AS dateleft,
      DATE_PART(
        'day',
        (
          ("formData"->'dateleft'->>'value')::date + 
          (CASE 
            WHEN lh.lead_campaign = 'morrisons' THEN INTERVAL '161 days'
            ELSE INTERVAL '0 days'
          END)
        ) - CURRENT_DATE
      ) AS daysuntilexpiry,
      "formData"->'firstname'->'value' AS firstname,
      "formData"->'lastname'->'value' AS lastname
    FROM "LeadHistory" lh
    WHERE ("formData"->'dateleft'->>'value') IS NOT NULL 
    AND ("formData"->'dateleft'->>'value') != '' AND lh.lead_email != ''
      AND lh.lead_status IN ('nurture')
      AND lh.lead_campaign in ('morrisons')
      AND DATE_PART(
          'day',
          (
            ("formData"->'dateleft'->>'value')::date + 
            (CASE 
              WHEN lh.lead_campaign = 'morrisons' THEN INTERVAL '161 days'
              ELSE INTERVAL '0 days'
            END)
          ) - CURRENT_DATE
        ) >= 1
      AND lead_email NOT IN (
        SELECT lead_email 
        FROM public."LeadHistory" 
        WHERE lead_status = 'sold'
        AND lh.lead_campaign in ('morrisons')
      )

  `;
  return data;
};

const nurtureSainsburys = async () => {
  const data = await prisma.$queryRaw<LeadHistoryResult[]>`
      SELECT 
        lh.id,
        lh.lead_email,
        lh.lead_status,
        "formData"->'telphone'->'value' AS telephone,
        CONCAT('https://claim.fairpayforall.co.uk/s/', lh.lead_id) AS url,
        lh.lead_campaign AS campaign,
        
        "formData"->'dateleft'->'value' AS dateleft,
        DATE_PART(
          'day',
          (
            ("formData"->'dateleft'->>'value')::date + 
            (CASE 
              WHEN lh.lead_campaign = 'sainsburys' THEN INTERVAL '161 days'
              ELSE INTERVAL '0 days'
            END)
          ) - CURRENT_DATE
        ) AS daysuntilexpiry,
        "formData"->'firstname'->'value' AS firstname,
        "formData"->'lastname'->'value' AS lastname
      FROM "LeadHistory" lh
      WHERE ("formData"->'dateleft'->>'value') IS NOT NULL 
      AND ("formData"->'dateleft'->>'value') != '' AND lh.lead_email != ''
        AND lh.lead_status IN ('nurture')
        AND lh.lead_campaign in ('sainsburys')
        AND DATE_PART(
          'day',
          (
            ("formData"->'dateleft'->>'value')::date + 
            (CASE 
              WHEN lh.lead_campaign = 'sainsburys' THEN INTERVAL '161 days'
              ELSE INTERVAL '0 days'
            END)
          ) - CURRENT_DATE
        ) >= 1
        AND lead_email NOT IN (
          SELECT lead_email 
          FROM public."LeadHistory" 
          WHERE lead_status = 'sold'
          AND lh.lead_campaign in ('sainsburys')
        )
  
    `;
  return data;
};

const nurtureAsda = async () => {
  const data = await prisma.$queryRaw<LeadHistoryResult[]>`
        SELECT 
          lh.id,
          lh.lead_email,
          lh.lead_status,
          "formData"->'telphone'->'value' AS telephone,
          CONCAT('https://claim.fairpayforall.co.uk/a/', lh.lead_id) AS url,
          lh.lead_campaign AS campaign,
          
          "formData"->'dateleft'->'value' AS dateleft,
          DATE_PART(
            'day',
            (
              ("formData"->'dateleft'->>'value')::date + 
              (CASE 
                WHEN lh.lead_campaign = 'asda' THEN INTERVAL '2002 days'
                ELSE INTERVAL '0 days'
              END)
            ) - CURRENT_DATE
          ) AS daysuntilexpiry,
          "formData"->'firstname'->'value' AS firstname,
          "formData"->'lastname'->'value' AS lastname
        FROM "LeadHistory" lh
        WHERE ("formData"->'dateleft'->>'value') IS NOT NULL 
        AND ("formData"->'dateleft'->>'value') != '' AND lh.lead_email != ''
          AND lh.lead_status IN ('nurture')
          AND lh.lead_campaign in ('asda')
          AND DATE_PART(
            'day',
            (
              ("formData"->'dateleft'->>'value')::date + 
              (CASE 
                WHEN lh.lead_campaign = 'asda' THEN INTERVAL '2002 days'
                ELSE INTERVAL '0 days'
              END)
            ) - CURRENT_DATE
          ) >= 1
          AND lead_email NOT IN (
            SELECT lead_email 
            FROM public."LeadHistory" 
            WHERE lead_status = 'sold'
            AND lh.lead_campaign in ('asda')
          )
    
      `;
  return data;
};

const nurtureCoop = async () => {
  const data = await prisma.$queryRaw<LeadHistoryResult[]>`
          SELECT 
            lh.id,
            lh.lead_email,
            lh.lead_status,
            "formData"->'telphone'->'value' AS telephone,
            CONCAT('https://claim.fairpayforall.co.uk/c/', lh.lead_id) AS url,
            lh.lead_campaign AS campaign,
            
            "formData"->'dateleft'->'value' AS dateleft,
            DATE_PART(
              'day',
              (
                ("formData"->'dateleft'->>'value')::date + 
                (CASE 
                  WHEN lh.lead_campaign = 'coop' THEN INTERVAL '161 days'
                  ELSE INTERVAL '0 days'
                END)
              ) - CURRENT_DATE
            ) AS daysuntilexpiry,
            "formData"->'firstname'->'value' AS firstname,
            "formData"->'lastname'->'value' AS lastname
          FROM "LeadHistory" lh
          WHERE ("formData"->'dateleft'->>'value') IS NOT NULL 
          AND ("formData"->'dateleft'->>'value') != '' AND lh.lead_email != ''
            AND lh.lead_status IN ('nurture')
            AND lh.lead_campaign in ('coop')
            AND DATE_PART(
              'day',
              (
                ("formData"->'dateleft'->>'value')::date + 
                (CASE 
                  WHEN lh.lead_campaign = 'coop' THEN INTERVAL '161 days'
                  ELSE INTERVAL '0 days'
                END)
              ) - CURRENT_DATE
            ) >= 1
            AND lead_email NOT IN (
              SELECT lead_email 
              FROM public."LeadHistory" 
              WHERE lead_status = 'sold'
              AND lh.lead_campaign in ('coop')
            )
      
        `;
  return data;
};

const nurtureNext = async () => {
  const data = await prisma.$queryRaw<LeadHistoryResult[]>`
            SELECT 
              lh.id,
              lh.lead_email,
              lh.lead_status,
              "formData"->'telphone'->'value' AS telephone,
              CONCAT('https://claim.fairpayforall.co.uk/n/', lh.lead_id) AS url,
              lh.lead_campaign AS campaign,
              
              "formData"->'dateleft'->'value' AS dateleft,
              DATE_PART(
                'day',
                (
                  ("formData"->'dateleft'->>'value')::date + 
                  (CASE 
                    WHEN lh.lead_campaign = 'next' THEN INTERVAL '161 days'
                    ELSE INTERVAL '0 days'
                  END)
                ) - CURRENT_DATE
              ) AS daysuntilexpiry,
              "formData"->'firstname'->'value' AS firstname,
              "formData"->'lastname'->'value' AS lastname
            FROM "LeadHistory" lh
            WHERE ("formData"->'dateleft'->>'value') IS NOT NULL 
            AND ("formData"->'dateleft'->>'value') != '' AND lh.lead_email != ''
              AND lh.lead_status IN ('nurture')
              AND lh.lead_campaign in ('next')
              AND DATE_PART(
                'day',
                (
                  ("formData"->'dateleft'->>'value')::date + 
                  (CASE 
                    WHEN lh.lead_campaign = 'next' THEN INTERVAL '161 days'
                    ELSE INTERVAL '0 days'
                  END)
                ) - CURRENT_DATE
              ) >= 1
              AND lead_email NOT IN (
                SELECT lead_email 
                FROM public."LeadHistory" 
                WHERE lead_status = 'sold'
                AND lh.lead_campaign in ('next')
              )
        
          `;
  return data;
};

const nurtureJusteat = async () => {
  const data = await prisma.$queryRaw<LeadHistoryResult[]>`
              SELECT 
                lh.id,
                lh.lead_email,
                lh.lead_status,
                "formData"->'telphone'->'value' AS telephone,
                CONCAT('https://claim.fairpayforall.co.uk/j/', lh.lead_id) AS url,
                lh.lead_campaign AS campaign,
                
                "formData"->'dateleft'->'value' AS dateleft,
                DATE_PART(
                  'day',
                  (
                    ("formData"->'dateleft'->>'value')::date + 
                    (CASE 
                      WHEN lh.lead_campaign = 'justeat' THEN INTERVAL '70 days'
                      ELSE INTERVAL '0 days'
                    END)
                  ) - CURRENT_DATE
                ) AS daysuntilexpiry,
                "formData"->'firstname'->'value' AS firstname,
                "formData"->'lastname'->'value' AS lastname
              FROM "LeadHistory" lh
              WHERE ("formData"->'dateleft'->>'value') IS NOT NULL 
              AND ("formData"->'dateleft'->>'value') != '' AND lh.lead_email != ''
                AND lh.lead_status IN ('nurture')
                AND lh.lead_campaign in ('justeat')
                AND DATE_PART(
                  'day',
                  (
                    ("formData"->'dateleft'->>'value')::date + 
                    (CASE 
                      WHEN lh.lead_campaign = 'justeat' THEN INTERVAL '70 days'
                      ELSE INTERVAL '0 days'
                    END)
                  ) - CURRENT_DATE
                ) >= 1
                AND lead_email NOT IN (
                  SELECT lead_email 
                  FROM public."LeadHistory" 
                  WHERE lead_status = 'sold'
                  AND lh.lead_campaign in ('justeat')
                )
          
            `;
  return data;
};

const nurtureBolt = async () => {
  const data = await prisma.$queryRaw<LeadHistoryResult[]>`
      SELECT 
        lh.id,
        lh.lead_email,
        lh.lead_status,
        "formData"->'telphone'->'value' AS telephone,
        CONCAT('https://claim.fairpayforall.co.uk/b/', lh.lead_id) AS url,
        lh.lead_campaign AS campaign,

        "formData"->'LastDelivery'->'value' AS dateleft,
        DATE_PART(
          'day',
          (
            ("formData"->'LastDelivery'->>'value')::date + 
            (CASE 
              WHEN lh.lead_campaign = 'morrisons' THEN INTERVAL '161 days'
              WHEN lh.lead_campaign = 'justeat' THEN INTERVAL '70 days'
              WHEN lh.lead_campaign = 'asda' THEN INTERVAL '2002 days'
              WHEN lh.lead_campaign = 'bolt' THEN INTERVAL '70 days'
              WHEN lh.lead_campaign = 'coop' THEN INTERVAL '161 days'
              WHEN lh.lead_campaign = 'next' THEN INTERVAL '161 days'
              WHEN lh.lead_campaign = 'sainsburys' THEN INTERVAL '161 days'
              ELSE INTERVAL '0 days'
            END)
          ) - CURRENT_DATE
        ) AS daysuntilexpiry,
        "formData"->'firstname'->'value' AS firstname,
        "formData"->'lastname'->'value' AS lastname
      FROM "LeadHistory" lh
      WHERE  lh.lead_email != ''
        AND lh.lead_status IN ('nurture')
        AND lh.lead_campaign in ('bolt')
        AND DATE_PART(
          'day',
          (
            ("formData"->'LastDelivery'->>'value')::date + 
            (CASE 
              WHEN lh.lead_campaign = 'bolt' THEN INTERVAL '70 days'
              ELSE INTERVAL '0 days'
            END)
          ) - CURRENT_DATE
        ) >= 1
        AND lead_email NOT IN (
          SELECT lead_email 
          FROM public."LeadHistory" 
          WHERE lead_status = 'sold'
          AND lh.lead_campaign in ('bolt')
        )
  
    `;
  return data;
};
export {
  nurtureMorrisons,
  nurtureSainsburys,
  nurtureAsda,
  nurtureBolt,
  nurtureCoop,
  nurtureNext,
  nurtureJusteat,
};
