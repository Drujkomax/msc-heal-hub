"use client";

// Политика конфиденциальности на трёх языках. Сервер пререндерит RU (страницы
// статичны для кэша), язык посетителя применяется на клиенте через useLang —
// тот же паттерн, что и у остальных публичных страниц.
import { useLang } from "~/shared/i18n/i18n-provider";
import type { Lang } from "~/shared/config/site";

type Section = { h: string; p?: string[]; list?: string[]; contactEmail?: boolean };
type Doc = { title: string; sections: Section[] };

export const PRIVACY_DOC: Record<Lang, Doc> = {
  ru: {
    title: "Политика конфиденциальности Med Service Centre",
    sections: [
      {
        h: "1. Общие положения",
        p: [
          "Настоящая политика обработки персональных данных составлена в соответствии с требованиями законодательства Республики Узбекистан и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые компанией Med Service Centre (далее — Оператор).",
        ],
      },
      {
        h: "2. Сбор персональных данных",
        p: [
          "Оператор может собирать следующие персональные данные Пользователя через формы заявки в социальных сетях (Facebook, Instagram) и на сайте:",
        ],
        list: [
          "Фамилия, Имя, Отчество;",
          "Номер телефона;",
          "Город проживания;",
          "Название клиники или организации;",
          "Должность.",
        ],
      },
      {
        h: "3. Цели обработки персональных данных",
        p: ["Сбор данных осуществляется исключительно для следующих целей:"],
        list: [
          "Предоставление Пользователю информации о медицинском оборудовании (коммерческие предложения, прайс-листы);",
          "Консультация по техническим характеристикам и условиям рассрочки;",
          "Заключение договоров на поставку и сервисное обслуживание оборудования.",
        ],
      },
      {
        h: "4. Передача данных третьим лицам",
        p: [
          "Оператор обязуется не передавать полученные персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством Республики Узбекистан (например, по запросу государственных органов), или если это необходимо для исполнения обязательств перед Пользователем (например, доставка оборудования логистической компанией).",
        ],
      },
      {
        h: "5. Безопасность данных",
        p: [
          "Оператор принимает необходимые организационные и технические меры для защиты персональной информации Пользователя от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения.",
        ],
      },
      {
        h: "6. Контактная информация",
        p: [
          "По вопросам, касающимся обработки персональных данных, Пользователь может обратиться к Оператору по электронной почте:",
        ],
        contactEmail: true,
      },
    ],
  },
  en: {
    title: "Med Service Centre Privacy Policy",
    sections: [
      {
        h: "1. General Provisions",
        p: [
          "This personal data processing policy has been drawn up in accordance with the requirements of the legislation of the Republic of Uzbekistan and defines the procedure for processing personal data and the security measures taken by Med Service Centre (hereinafter — the Operator).",
        ],
      },
      {
        h: "2. Collection of Personal Data",
        p: [
          "The Operator may collect the following personal data of the User through request forms on social networks (Facebook, Instagram) and on the website:",
        ],
        list: [
          "Last name, first name, patronymic;",
          "Phone number;",
          "City of residence;",
          "Name of the clinic or organization;",
          "Job title.",
        ],
      },
      {
        h: "3. Purposes of Personal Data Processing",
        p: ["Data is collected solely for the following purposes:"],
        list: [
          "Providing the User with information about medical equipment (commercial proposals, price lists);",
          "Consulting on technical specifications and installment terms;",
          "Concluding contracts for the supply and servicing of equipment.",
        ],
      },
      {
        h: "4. Transfer of Data to Third Parties",
        p: [
          "The Operator undertakes not to transfer the received personal data to third parties, except in cases provided for by the legislation of the Republic of Uzbekistan (for example, at the request of state authorities), or when necessary to fulfil obligations to the User (for example, equipment delivery by a logistics company).",
        ],
      },
      {
        h: "5. Data Security",
        p: [
          "The Operator takes the necessary organizational and technical measures to protect the User's personal information from unlawful or accidental access, destruction, modification, blocking, copying and distribution.",
        ],
      },
      {
        h: "6. Contact Information",
        p: [
          "For questions regarding the processing of personal data, the User may contact the Operator by email:",
        ],
        contactEmail: true,
      },
    ],
  },
  uz: {
    title: "Med Service Centre maxfiylik siyosati",
    sections: [
      {
        h: "1. Umumiy qoidalar",
        p: [
          "Ushbu shaxsiy ma'lumotlarni qayta ishlash siyosati O'zbekiston Respublikasi qonunchiligi talablariga muvofiq tuzilgan bo'lib, Med Service Centre kompaniyasi (keyingi o'rinlarda — Operator) tomonidan shaxsiy ma'lumotlarni qayta ishlash tartibini va ularning xavfsizligini ta'minlash choralarini belgilaydi.",
        ],
      },
      {
        h: "2. Shaxsiy ma'lumotlarni yig'ish",
        p: [
          "Operator ijtimoiy tarmoqlardagi (Facebook, Instagram) va saytdagi ariza shakllari orqali Foydalanuvchining quyidagi shaxsiy ma'lumotlarini yig'ishi mumkin:",
        ],
        list: [
          "Familiya, ism, otasining ismi;",
          "Telefon raqami;",
          "Yashash shahri;",
          "Klinika yoki tashkilot nomi;",
          "Lavozim.",
        ],
      },
      {
        h: "3. Shaxsiy ma'lumotlarni qayta ishlash maqsadlari",
        p: ["Ma'lumotlar faqat quyidagi maqsadlarda yig'iladi:"],
        list: [
          "Foydalanuvchiga tibbiy uskunalar haqida ma'lumot berish (tijoriy takliflar, narxlar ro'yxati);",
          "Texnik xususiyatlar va bo'lib to'lash shartlari bo'yicha maslahat berish;",
          "Uskunalarni yetkazib berish va servis xizmati shartnomalarini tuzish.",
        ],
      },
      {
        h: "4. Ma'lumotlarni uchinchi shaxslarga berish",
        p: [
          "Operator olingan shaxsiy ma'lumotlarni uchinchi shaxslarga bermaslik majburiyatini oladi, bundan O'zbekiston Respublikasi qonunchiligida nazarda tutilgan holatlar (masalan, davlat organlarining so'roviga ko'ra) yoki Foydalanuvchi oldidagi majburiyatlarni bajarish uchun zarur bo'lgan holatlar (masalan, uskunani logistika kompaniyasi orqali yetkazib berish) mustasno.",
        ],
      },
      {
        h: "5. Ma'lumotlar xavfsizligi",
        p: [
          "Operator Foydalanuvchining shaxsiy ma'lumotlarini noqonuniy yoki tasodifiy kirish, yo'q qilish, o'zgartirish, bloklash, nusxalash va tarqatishdan himoya qilish uchun zarur tashkiliy va texnik choralarni ko'radi.",
        ],
      },
      {
        h: "6. Aloqa ma'lumotlari",
        p: [
          "Shaxsiy ma'lumotlarni qayta ishlashga oid savollar bo'yicha Foydalanuvchi Operatorga elektron pochta orqali murojaat qilishi mumkin:",
        ],
        contactEmail: true,
      },
    ],
  },
};

export function PrivacyPolicyView() {
  const lang = (useLang() as Lang) || "ru";
  const doc = PRIVACY_DOC[lang] ?? PRIVACY_DOC.ru;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">{doc.title}</h1>

      <div className="space-y-8 text-muted-foreground">
        {doc.sections.map((section) => (
          <section key={section.h}>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{section.h}</h2>
            {section.p?.map((para) => (
              <p key={para.slice(0, 40)} className={section.list ? "mb-4" : undefined}>
                {para}
                {section.contactEmail && (
                  <>
                    {" "}
                    <a href="mailto:kamilov.tolib@medsc.uz" className="font-medium text-primary hover:underline">
                      kamilov.tolib@medsc.uz
                    </a>
                  </>
                )}
              </p>
            ))}
            {section.list && (
              <ul className="ml-4 list-inside list-disc space-y-2">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
