/**
 * Offline sample stories, used by `npm run ingest -- --sample` (or the "Load sample stories"
 * button) when live RSS feeds can't be reached, e.g. in a sandbox or on stage without Wi-Fi.
 * They are fictional and are labelled "Sample Desk" everywhere they appear.
 */
export interface SampleArticle {
  slug: string; // kebab-case, unique
  topic: string; // one of the topic ids below
  title: string;
  excerpt: string; // one sentence, <= 200 chars
  body: string; // 130-200 words, 6-9 sentences, plain text, paragraphs separated by "\n\n"
  hoursAgo: number; // 1..30, how long ago it was "published"
}

export const SAMPLE_ARTICLES: SampleArticle[] = [
  // ---------------------------------------------------------------- world
  {
    slug: "regional-water-treaty-talks-resume",
    topic: "world",
    title: "Upstream and downstream nations resume water-sharing talks after two-year pause",
    excerpt:
      "Delegates from five river-basin countries met in Geneva to restart negotiations on a shared water treaty, with drought data driving the agenda.",
    body:
      "Delegates from five river-basin countries resumed water-sharing negotiations in Geneva on Tuesday, ending a two-year pause caused by disputes over dam construction. The talks focus on a shared monitoring system that would publish river flow readings every six hours from 40 gauging stations. Negotiators said last summer's drought, which cut flows by nearly 30 percent in the lower basin, made a data-sharing deal more urgent than any allocation formula.\n\n" +
      "A draft text seen by observers proposes an independent technical secretariat funded equally by all five governments. It would also create an early-warning protocol requiring upstream reservoirs to notify neighbours 72 hours before large releases. Farmers' groups in the delta have pushed for that clause after flash releases damaged crops twice in three years.\n\n" +
      "Diplomats cautioned that the hardest questions, including how water is divided in dry years, remain unresolved. The next round is scheduled for March, and mediators hope to present a signed framework at a regional summit in the autumn.",
    hoursAgo: 3,
  },
  {
    slug: "port-city-elections-explainer",
    topic: "world",
    title: "Explainer: why a small port city's election is being watched across the region",
    excerpt:
      "A mayoral race in the fictional free port of Marevo has become a test of whether trade hubs can balance growth with housing costs.",
    body:
      "Voters in the free port of Marevo choose a new mayor on Sunday in a race that has become a regional test of how trade hubs manage rapid growth. The city's container traffic has doubled in a decade to 4.2 million units a year, but median rents have risen 70 percent over the same period. Both leading candidates agree the housing shortage is the central issue, yet they offer sharply different fixes.\n\n" +
      "Candidate Ilse Varga, a former harbour engineer, wants to convert 120 hectares of disused dockland into public housing. Her rival, businessman Tomas Reyl, proposes tax incentives for private developers and a faster permit process. Polls show the race within three points, with roughly one in five voters undecided.\n\n" +
      "Analysts say neighbouring ports, which face similar pressures, will study the outcome closely. Turnout is expected to exceed 60 percent for the first time since 2010.",
    hoursAgo: 9,
  },
  {
    slug: "un-agency-food-price-index-falls",
    topic: "world",
    title: "Global food price index falls for third straight month as grain harvests recover",
    excerpt:
      "A UN agency's benchmark food price index dropped 2.1 percent in September, led by cheaper wheat and vegetable oils.",
    body:
      "Global food prices fell for a third consecutive month in September, according to a benchmark index published by a United Nations agency. The index dropped 2.1 percent from August, driven mainly by cheaper wheat, maize and vegetable oils. Strong harvests in the southern hemisphere and lower shipping costs through key straits helped ease supply concerns that had pushed prices higher earlier in the year.\n\n" +
      "Dairy and sugar prices moved in the opposite direction, rising 1.4 percent and 3.2 percent respectively. Economists noted that the overall index remains about 18 percent above its pre-pandemic average, so household budgets in import-dependent countries are still under strain.\n\n" +
      "The agency warned that a weak monsoon or a sudden rise in fuel prices could quickly reverse the trend. It also urged governments to avoid export bans, which it said amplified price spikes during previous crises. The next index update is due in early November.",
    hoursAgo: 14,
  },

  // ---------------------------------------------------------------- pakistan
  {
    slug: "karachi-bus-rapid-transit-new-line",
    topic: "pakistan",
    title: "Karachi opens new bus rapid transit corridor linking Korangi to Saddar",
    excerpt:
      "A 21-kilometre BRT line in Karachi began trial operations with 80 electric buses, aiming to carry 150,000 passengers a day.",
    body:
      "Karachi opened a new 21-kilometre bus rapid transit corridor on Monday, linking the industrial Korangi area with the city centre in Saddar. The line runs 80 electric buses on dedicated lanes and is designed to carry about 150,000 passengers a day once fully operational. Officials said a trip that typically takes 75 minutes in traffic should now take around 35.\n\n" +
      "Fares during the three-week trial period are capped at 50 rupees, and women-only carriages operate during peak hours. The provincial transport department said 26 stations are open, with four more due by December. Charging depots at each end of the line run partly on rooftop solar panels.\n\n" +
      "Commuters on the first morning praised the air-conditioned buses but complained about long queues at ticket counters. The operator said a contactless card system will launch next month. Urban planners called the corridor a test of whether Karachi can shift factory workers away from crowded minibuses and motorcycles.",
    hoursAgo: 2,
  },
  {
    slug: "lahore-smog-season-action-plan",
    topic: "pakistan",
    title: "Lahore unveils smog action plan ahead of winter, with school timing changes",
    excerpt:
      "Punjab authorities announced crop-burning patrols, brick kiln inspections and staggered school hours to cut Lahore's winter smog.",
    body:
      "Punjab authorities announced a winter smog action plan for Lahore on Wednesday, combining crop-burning patrols, factory inspections and staggered school hours. The plan targets the November-to-January period, when the city's air quality index regularly climbs above 400. Officials said 300 field teams will monitor rice-stubble burning in surrounding districts using drone and satellite alerts.\n\n" +
      "More than 1,200 brick kilns must prove they have switched to cleaner zigzag technology or face closure. Schools in the city will start an hour later on days when pollution passes a hazardous threshold, and outdoor sports will be suspended. Hospitals have been asked to prepare respiratory wards for a seasonal surge in asthma cases.\n\n" +
      "Environmental groups welcomed the measures but said vehicle emissions, which account for a large share of pollution, need stronger action. The provincial government said a fuel-quality testing drive at petrol stations will begin next week.",
    hoursAgo: 7,
  },
  {
    slug: "islamabad-tech-park-it-exports",
    topic: "pakistan",
    title: "Islamabad tech park expansion targets $500 million in IT exports",
    excerpt:
      "A new phase of an Islamabad software technology park will add space for 6,000 workers as Pakistan pushes to grow IT exports.",
    body:
      "A new phase of a software technology park in Islamabad opened on Thursday, adding office space for about 6,000 IT workers and targeting $500 million in annual exports. The federal IT ministry said 45 companies, mostly small software houses and freelancer collectives, have already signed leases. The building offers backup power, high-speed fibre links and subsidised rent for firms in their first two years.\n\n" +
      "Pakistan's IT and IT-enabled services exports have grown steadily, and officials want to double them within five years. Industry groups say reliable electricity and internet remain the biggest obstacles for companies serving clients in Europe and North America.\n\n" +
      "The park also hosts a training centre that plans to certify 2,000 graduates a year in cloud computing, cybersecurity and data engineering. Similar facilities are planned in Karachi and Lahore, though funding for those has not yet been approved. Startups said the shared infrastructure could cut their operating costs by up to a quarter.",
    hoursAgo: 18,
  },

  // ---------------------------------------------------------------- business
  {
    slug: "central-bank-holds-rates",
    topic: "business",
    title: "Central bank holds interest rates steady as inflation cools to 6.8 percent",
    excerpt:
      "The central bank kept its policy rate unchanged at 12 percent, saying inflation is falling but energy prices remain a risk.",
    body:
      "The central bank kept its benchmark interest rate unchanged at 12 percent on Monday, saying inflation is cooling but remains above its target range. Consumer prices rose 6.8 percent year on year in September, down from 8.1 percent in August. The monetary policy committee said lower food prices and a stable currency drove the improvement.\n\n" +
      "Governors warned that a planned increase in electricity tariffs could push inflation up again early next year. Most economists surveyed before the meeting had expected a hold, though a minority predicted a cut of half a percentage point.\n\n" +
      "Business groups expressed disappointment, arguing that high borrowing costs are holding back investment in manufacturing. Banks said demand for car and housing loans has been flat for six months. The bank's next policy decision is due in December, and it signalled that cuts could follow if inflation keeps falling.",
    hoursAgo: 4,
  },
  {
    slug: "crypto-exchange-rules-tightened",
    topic: "business",
    title: "Regulators tighten rules for crypto exchanges after customer fund losses",
    excerpt:
      "New rules require crypto exchanges to hold customer assets separately and publish monthly proof-of-reserves audits.",
    body:
      "Financial regulators announced stricter rules for crypto exchanges on Friday, requiring them to keep customer funds separate from company money. The move follows the collapse of a mid-sized trading platform, fictional firm CoinHarbor, which left about 40,000 users unable to withdraw deposits. Under the new framework, exchanges must publish monthly proof-of-reserves reports checked by independent auditors.\n\n" +
      "Platforms will also need minimum capital of 500 million rupees and must appoint a local compliance officer. Advertising that promises guaranteed returns on bitcoin or other tokens will be banned outright. Exchanges have nine months to comply or lose their licences.\n\n" +
      "Industry associations said the rules bring welcome clarity but could push smaller operators out of the market. Consumer advocates argued the changes should have come years earlier. Analysts expect two or three of the country's dozen licensed exchanges to merge rather than raise the required capital.",
    hoursAgo: 11,
  },
  {
    slug: "textile-exporters-new-orders",
    topic: "business",
    title: "Textile exporters report rise in orders as European buyers diversify suppliers",
    excerpt:
      "Garment makers say export orders rose 14 percent in the third quarter as European retailers spread sourcing across more countries.",
    body:
      "Textile and garment exporters reported a 14 percent rise in new orders in the third quarter, as European retailers spread their sourcing across more countries. An industry association said home textiles such as towels and bed linen saw the strongest demand. Several mills in Faisalabad and Sialkot have added night shifts to meet delivery deadlines before the holiday season.\n\n" +
      "Buyers are increasingly asking for traceable cotton and proof of fair labour practices, according to exporters. Companies that invested in water recycling and solar power said they were winning contracts that require environmental certification.\n\n" +
      "Manufacturers warned that high energy costs could erode their price advantage over regional competitors. They are lobbying for a special industrial electricity tariff. The association estimates that textile exports, the country's largest source of foreign earnings, could reach a record this financial year if power prices stay stable.",
    hoursAgo: 22,
  },

  // ---------------------------------------------------------------- technology
  {
    slug: "national-5g-spectrum-auction",
    topic: "technology",
    title: "Telecom regulator sets date for first 5G spectrum auction",
    excerpt:
      "The telecom regulator will auction 5G spectrum in February, with coverage obligations for major cities within 18 months.",
    body:
      "The national telecom regulator said on Tuesday that it will hold the country's first 5G spectrum auction in February. Operators will bid for blocks in the 2.6 GHz and 3.5 GHz bands, with a reserve price set in US dollars to attract foreign investment. Winners must offer 5G coverage in Karachi, Lahore and Islamabad within 18 months and extend it to ten more cities within four years.\n\n" +
      "The regulator also proposed allowing operators to share towers and fibre to cut deployment costs. Analysts estimate that fewer than 5 percent of mobile phones in use today support 5G, so early uptake is likely to be slow.\n\n" +
      "Industry executives welcomed the timeline but said high spectrum prices could delay network upgrades. Consumer groups want the regulator to require affordable data plans as a licence condition. A public consultation on the auction rules runs until the end of November.",
    hoursAgo: 5,
  },
  {
    slug: "smartphone-repair-rules-explainer",
    topic: "technology",
    title: "Explainer: what new right-to-repair rules mean for your next phone",
    excerpt:
      "New repair rules require phone makers to sell spare parts for seven years and make batteries replaceable with common tools.",
    body:
      "New right-to-repair rules taking effect next year will require phone makers to sell spare parts for at least seven years after a model is discontinued. Batteries must be replaceable using commonly available tools, without heat guns or special solvents. Manufacturers will also have to publish repair manuals and keep software updates available for five years.\n\n" +
      "Supporters say the rules could extend the average phone's life from about three years to five, cutting electronic waste significantly. Independent repair shops expect more business, since they will be able to buy genuine parts at regulated prices.\n\n" +
      "Some manufacturers argue that replaceable batteries make phones thicker and less water-resistant. Engineers say recent designs show the trade-off can be small. For consumers, the practical change is that a worn battery or cracked screen should become a cheaper fix rather than a reason to buy a new device.",
    hoursAgo: 16,
  },
  {
    slug: "data-centre-cooling-water-use",
    topic: "technology",
    title: "Data centre boom raises questions about water use for cooling",
    excerpt:
      "A new report finds that large data centres can use millions of litres of water a day, prompting calls for disclosure rules.",
    body:
      "A new report by a university research group finds that large data centres can consume several million litres of water a day for cooling, prompting calls for mandatory disclosure. The study examined 60 facilities and found that water use varied tenfold depending on climate and cooling design. Sites using evaporative cooling in hot regions were the heaviest consumers.\n\n" +
      "Demand for computing power, driven partly by AI workloads, has led operators to build bigger facilities at a rapid pace. The researchers estimate that global data centre electricity use could double within five years.\n\n" +
      "Some newer sites use closed-loop liquid cooling, which recycles water and cuts consumption by up to 90 percent. The report recommends that operators publish water and energy figures for each site annually. Local councils in water-stressed areas have started attaching conditions to new building permits, including limits on groundwater extraction.",
    hoursAgo: 27,
  },

  // ---------------------------------------------------------------- ai
  {
    slug: "open-llm-benchmark-reasoning",
    topic: "ai",
    title: "Research team releases open benchmark to test LLM reasoning on real-world tasks",
    excerpt:
      "A new open benchmark of 5,000 multi-step tasks aims to measure how well large language models reason beyond memorised answers.",
    body:
      "A consortium of university researchers released an open benchmark on Wednesday designed to test how well large language models handle multi-step reasoning on realistic tasks. The benchmark contains 5,000 problems, from reading tax forms to planning delivery routes, and every task was written after the training cut-off of current models. The team says this reduces the chance that LLMs score well simply by memorising answers.\n\n" +
      "In early tests, the best-performing models solved about 61 percent of problems, while smaller open-weight models averaged around 35 percent. Performance dropped sharply on tasks needing more than six steps or careful arithmetic.\n\n" +
      "The researchers have published the full dataset and grading code so other labs can reproduce results. They plan to add new problems every quarter to keep the benchmark fresh. AI safety groups welcomed the release, saying better evaluation is essential as companies deploy language models in finance and healthcare.",
    hoursAgo: 3,
  },
  {
    slug: "ai-tutors-pilot-schools",
    topic: "ai",
    title: "AI tutors pilot in 40 schools shows gains in maths, but teachers remain central",
    excerpt:
      "A year-long trial of AI tutoring in 40 public schools found modest maths gains when teachers guided how students used the tool.",
    body:
      "A year-long pilot of AI tutoring software in 40 public schools found that students improved their maths scores by an average of 8 percent compared with a control group. The gains were largest in classes where teachers set specific goals for each session rather than leaving students to use the chatbot freely. The trial involved about 9,000 students aged 11 to 14.\n\n" +
      "The tutor, built on a large language model, was configured to give hints instead of final answers. Researchers found that students who copied answers from other sources saw no improvement at all.\n\n" +
      "Teachers reported spending less time on marking but more time reviewing chat logs and correcting misconceptions. Parents raised concerns about data privacy, and the education department said all logs are deleted after 90 days. The department plans to expand the pilot to 200 schools next year, alongside training for teachers.",
    hoursAgo: 10,
  },
  {
    slug: "urdu-language-model-release",
    topic: "ai",
    title: "Karachi university team releases Urdu language model trained on public texts",
    excerpt:
      "Researchers in Karachi released an open Urdu language model trained on 40 billion words of books, news and government documents.",
    body:
      "A university research team in Karachi released an open-source Urdu language model on Friday, trained on about 40 billion words of public books, news archives and government documents. The researchers say the model handles Urdu script, Roman Urdu and code-switching with English better than general-purpose LLMs. It has 7 billion parameters, small enough to run on a single high-end graphics card.\n\n" +
      "In tests on reading comprehension and summarisation, the model outperformed larger multilingual systems by an average of 12 points. The team also published a cleaned training dataset and an evaluation suite covering legal, medical and agricultural texts.\n\n" +
      "Developers said the release could help build chatbots for farmers, customer support tools and document search in local languages. The researchers cautioned that the model still makes factual errors and should not be used for medical advice. They are now collecting Punjabi and Sindhi text for a follow-up project.",
    hoursAgo: 20,
  },

  // ---------------------------------------------------------------- programming
  {
    slug: "typescript-type-checker-faster",
    topic: "programming",
    title: "Faster type checking: what a native compiler port means for TypeScript developers",
    excerpt:
      "A rewrite of TypeScript tooling in a compiled language promises type checks up to ten times faster on large codebases.",
    body:
      "Developers testing a native port of TypeScript tooling report type-check times up to ten times faster on large codebases. The port rewrites the compiler in a compiled systems language while keeping the same type-checking behaviour. On a sample monorepo with 1.5 million lines of code, a full check dropped from 70 seconds to under 8 seconds.\n\n" +
      "Editor features such as autocomplete and go-to-definition also feel noticeably quicker, according to early testers. Memory use fell by roughly half, which matters on laptops and continuous integration servers.\n\n" +
      "The new tooling is still in preview, and some plugins that hook into compiler internals do not yet work. Maintainers recommend teams run it alongside their existing setup and compare outputs before switching. For most projects, no code changes should be required, since the language itself is unchanged. A stable release is expected within the next year.",
    hoursAgo: 6,
  },
  {
    slug: "open-source-maintainer-burnout-survey",
    topic: "programming",
    title: "Survey finds most open-source maintainers are unpaid and considering quitting",
    excerpt:
      "A survey of 2,300 open-source maintainers found 58 percent are unpaid and nearly half have considered abandoning their projects.",
    body:
      "A survey of 2,300 open-source maintainers found that 58 percent receive no payment for their work and 46 percent have considered abandoning their projects in the past year. The study, run by a non-profit software foundation, covered maintainers of libraries downloaded millions of times a week. Respondents cited demanding users, security reports and lack of time as their biggest stresses.\n\n" +
      "Maintainers who received even modest funding, around $500 a month, were twice as likely to say they planned to continue. Many said they would prefer companies to contribute engineering time rather than one-off donations.\n\n" +
      "The foundation recommends that businesses audit their dependencies and sponsor the projects they rely on most. It also suggests clearer contribution guidelines and automated triage to reduce the burden of issue reports. Security experts warn that abandoned packages are a common route for supply-chain attacks in programming ecosystems.",
    hoursAgo: 15,
  },
  {
    slug: "lahore-coding-bootcamp-graduates",
    topic: "programming",
    title: "Lahore coding bootcamp reports 72 percent job placement for latest cohort",
    excerpt:
      "A Lahore programming bootcamp says 72 percent of its 400 graduates found developer jobs within six months, many working remotely.",
    body:
      "A coding bootcamp in Lahore says 72 percent of its latest cohort of 400 graduates found developer jobs within six months of finishing the course. The 16-week programme teaches JavaScript, Python, databases and version control, with a final project built for a real client. More than half of those placed are working remotely for companies abroad.\n\n" +
      "Average starting salaries were around 180,000 rupees a month, well above typical entry-level pay in the city. Women made up 38 percent of the cohort, up from 22 percent two years ago, after the bootcamp introduced scholarships and evening classes.\n\n" +
      "Employers said graduates were strong at building web apps but needed more practice with testing and code review. The bootcamp plans to add a module on writing automated tests and using AI coding assistants responsibly. It is also opening a smaller campus in Faisalabad next spring.",
    hoursAgo: 25,
  },

  // ---------------------------------------------------------------- startups
  {
    slug: "lahore-fintech-series-a",
    topic: "startups",
    title: "Lahore-based fintech raises $18 million Series A to expand small-business lending",
    excerpt:
      "Fictional fintech Qarzly closed an $18 million Series A funding round to grow its credit service for small retailers.",
    body:
      "Qarzly, a Lahore-based fintech that offers short-term credit to small retailers, has raised $18 million in a Series A funding round. The round was led by a regional venture capital fund, with participation from two existing angel investors. The startup says it has issued more than 90,000 loans to shopkeepers since launching in 2023, with a default rate below 3 percent.\n\n" +
      "Qarzly uses sales data from point-of-sale apps to assess creditworthiness instead of traditional collateral. Founder Ayesha Malik said the new funding will help the company expand to Karachi and Peshawar and hire 60 engineers.\n\n" +
      "The deal is one of the largest early-stage rounds in the country this year, as overall startup funding has slowed. Investors say lending startups with strong repayment data are attracting more interest than consumer apps burning cash on growth. The company plans to apply for a microfinance licence next year.",
    hoursAgo: 2,
  },
  {
    slug: "agritech-startup-seed-round",
    topic: "startups",
    title: "Agritech startup raises seed round for soil sensors aimed at smallholder farmers",
    excerpt:
      "Fictional startup FieldPulse raised $2.5 million in seed funding to sell low-cost soil sensors to farmers in Sindh and Punjab.",
    body:
      "FieldPulse, an agritech startup that makes low-cost soil moisture sensors, has raised $2.5 million in a seed funding round. The company sells sensors for about 6,000 rupees each and sends irrigation advice to farmers by SMS in local languages. It says pilot users in Sindh and Punjab cut water use by 20 percent while keeping wheat yields stable.\n\n" +
      "The round was led by an impact investment fund focused on climate adaptation. FieldPulse plans to use the money to build a manufacturing line and reach 25,000 farms within two years.\n\n" +
      "Co-founder Bilal Haider said the hardest part has been building trust with farmers who are wary of new technology. The startup now trains local shopkeepers to install devices and explain readings. Investors noted that water scarcity and rising fuel costs for tube wells are creating strong demand for tools that help farmers irrigate more precisely.",
    hoursAgo: 12,
  },
  {
    slug: "startup-funding-winter-explainer",
    topic: "startups",
    title: "Explainer: how founders are adapting to a slower funding market",
    excerpt:
      "With venture funding down sharply from its peak, founders are cutting burn, chasing revenue and raising smaller rounds.",
    body:
      "Startup founders are adapting to a slower venture funding market by cutting costs, focusing on revenue and raising smaller rounds than they would have three years ago. Regional data shows total startup funding this year is running about 40 percent below its 2022 peak. Seed rounds are still being done, but investors are asking for clearer paths to profitability.\n\n" +
      "Many companies now aim for 24 to 30 months of runway instead of 18. Bridge rounds and convertible notes from existing investors have become more common as founders avoid setting a lower valuation.\n\n" +
      "Some sectors are faring better than others. Business software, fintech with strong repayment data and climate-related startups continue to attract interest, while delivery and social apps face tougher questions. Advisers recommend founders track unit economics closely and talk to investors months before they need money. Accelerators report that applications have actually risen, suggesting entrepreneurship remains popular despite the downturn.",
    hoursAgo: 28,
  },

  // ---------------------------------------------------------------- science
  {
    slug: "glacier-lake-early-warning-study",
    topic: "science",
    title: "Study maps 3,000 glacial lakes at risk of sudden floods in northern mountains",
    excerpt:
      "Scientists used satellite data to identify 3,000 glacial lakes in the northern mountains, 36 of which pose a high flood risk.",
    body:
      "Scientists have used satellite imagery to map more than 3,000 glacial lakes in the northern mountain ranges, identifying 36 that pose a high risk of sudden outburst floods. The study, published by a team from a university in Islamabad and international partners, tracked lake growth over 20 years. Total lake area in the region has expanded by about 15 percent since 2004 as glaciers retreat.\n\n" +
      "Glacial lake outburst floods occur when natural dams of ice or rock fail, releasing huge volumes of water in minutes. Several villages in Gilgit-Baltistan and Chitral lie within 10 kilometres of the highest-risk lakes.\n\n" +
      "The researchers recommend installing water-level sensors and sirens at the most dangerous sites. They also call for regular drone surveys to check the stability of moraine dams. Local disaster authorities said they will use the findings to update evacuation plans before next summer's melt season.",
    hoursAgo: 8,
  },
  {
    slug: "new-antibiotic-soil-bacteria",
    topic: "science",
    title: "Researchers discover antibiotic compound in desert soil bacteria",
    excerpt:
      "A compound found in bacteria from desert soil killed several drug-resistant strains in laboratory tests, researchers report.",
    body:
      "Researchers have discovered a new antibiotic compound produced by bacteria living in desert soil, which killed several drug-resistant strains in laboratory tests. The team screened about 10,000 bacterial samples collected from arid regions before finding the molecule. It works by disrupting the outer membrane of bacteria, a mechanism that makes resistance harder to develop.\n\n" +
      "In mouse studies, the compound cleared infections caused by a resistant strain of bacteria commonly found in hospitals. No serious side effects were observed at effective doses, although researchers stressed that animal results often do not translate to humans.\n\n" +
      "Antimicrobial resistance is linked to more than a million deaths worldwide each year. The team estimates that human trials could begin within four years if further safety tests succeed. They have also made their screening method public so other labs can search different soil types for similar molecules.",
    hoursAgo: 17,
  },
  {
    slug: "how-quantum-sensors-work",
    topic: "science",
    title: "Explainer: how quantum sensors could find water underground",
    excerpt:
      "Quantum gravity sensors measure tiny changes in the pull of gravity and could help locate groundwater without drilling.",
    body:
      "Quantum gravity sensors, which measure tiny changes in the pull of gravity, could help locate underground water and mineral deposits without drilling test wells. The devices work by cooling atoms to near absolute zero and dropping them inside a vacuum chamber. Lasers track how fast the atoms fall, revealing differences in density beneath the surface.\n\n" +
      "Conventional gravity meters drift over time and need frequent calibration, while quantum sensors stay stable for weeks. A field trial by a European research institute detected an underground tunnel two metres wide at a depth of seven metres.\n\n" +
      "The technology is still bulky and expensive, with current units weighing about 50 kilograms. Engineers are working on portable versions that could be carried by vehicles or drones. Hydrologists say that if costs fall, the sensors could help drought-prone regions map aquifers far more cheaply than drilling exploratory boreholes.",
    hoursAgo: 29,
  },

  // ---------------------------------------------------------------- space
  {
    slug: "mars-sample-mission-timeline",
    topic: "space",
    title: "Mars sample return mission gets new timeline and cheaper design",
    excerpt:
      "A revised plan to bring rock samples back from Mars would use a smaller lander and return material by the late 2030s.",
    body:
      "A revised plan to return rock samples from Mars would use a smaller lander and a simplified rocket, bringing material to Earth by the late 2030s. Space agency engineers say the new design could cut costs by about a third compared with the previous proposal. The samples, sealed in tubes by a rover already on the surface, may contain chemical signs of ancient microbial life.\n\n" +
      "Under the plan, a lander would touch down near the rover's location and launch the tubes into Mars orbit. An orbiting spacecraft would then capture the container and carry it home over roughly two years.\n\n" +
      "Scientists welcomed the clearer timeline but warned that further budget cuts could delay the mission again. The tubes hold samples from an ancient river delta, considered one of the best places to search for fossilised life on the red planet. A final design review is scheduled for next spring.",
    hoursAgo: 4,
  },
  {
    slug: "national-space-agency-satellite-launch",
    topic: "space",
    title: "National space agency launches second Earth-observation satellite",
    excerpt:
      "The national space agency's new satellite will photograph crops, floods and cities at 1-metre resolution every three days.",
    body:
      "The national space agency successfully launched its second Earth-observation satellite on Saturday aboard a rocket from a partner country's launch site. The satellite reached its planned orbit about 17 minutes after lift-off and sent its first signals to a ground station near Karachi within two hours. It carries a camera that can photograph features as small as one metre across.\n\n" +
      "Officials said the satellite will revisit any point in the country every three days, helping monitor crops, floods, glaciers and urban growth. Images will be shared free of charge with universities and provincial disaster agencies.\n\n" +
      "The agency's first observation satellite, launched four years ago, is still operating but nearing the end of its design life. Engineers will spend six weeks testing instruments before regular imaging begins. The agency plans to launch a weather satellite and a small communications satellite before 2030.",
    hoursAgo: 13,
  },
  {
    slug: "reusable-rocket-booster-record",
    topic: "space",
    title: "Reusable rocket booster lands for a record 30th time",
    excerpt:
      "A first-stage booster completed its 30th flight and landing, showing how reusability is cutting the cost of rocket launches.",
    body:
      "A reusable rocket booster flew and landed for a record 30th time on Thursday, after placing a batch of communications satellites into orbit. The first stage separated about two and a half minutes after launch and touched down on a drone ship roughly 600 kilometres offshore. Engineers said inspections after each flight now take days rather than weeks.\n\n" +
      "Reusability has reduced the cost of reaching orbit dramatically over the past decade. Industry estimates suggest launch prices per kilogram have fallen by more than 70 percent since boosters began being recovered routinely.\n\n" +
      "Several countries and private companies are now developing their own reusable rockets, including designs that would return both stages. Critics point out that the growing number of launches adds to space debris and upper-atmosphere pollution. Regulators are discussing new rules on deorbiting old satellites to keep busy orbits manageable.",
    hoursAgo: 24,
  },

  // ---------------------------------------------------------------- health
  {
    slug: "dengue-cases-rise-after-monsoon",
    topic: "health",
    title: "Dengue cases rise after late monsoon rains; hospitals open fever wards",
    excerpt:
      "Health officials reported 4,800 dengue cases in two weeks and urged residents to clear standing water around homes.",
    body:
      "Health officials reported about 4,800 new dengue cases over the past two weeks, as late monsoon rains left standing water across several cities. Hospitals in Karachi, Lahore and Rawalpindi have opened dedicated fever wards and extended laboratory hours for blood tests. Most patients recover with rest and fluids, but doctors say severe cases need careful monitoring of platelet levels.\n\n" +
      "Health teams are spraying larvicide in neighbourhoods with the highest case counts. Officials urged residents to empty water containers, cover tanks and use mosquito nets, since the dengue mosquito breeds in clean, still water and bites mainly during the day.\n\n" +
      "Doctors warned against taking painkillers such as aspirin or ibuprofen for fever, as they can increase bleeding risk. Paracetamol is recommended instead. Cases usually peak in late October and decline as temperatures fall, but officials said the season may last longer this year because of the delayed rains.",
    hoursAgo: 5,
  },
  {
    slug: "walking-study-heart-health",
    topic: "health",
    title: "Study: 7,000 steps a day linked to big drop in heart disease risk",
    excerpt:
      "A large study found that walking about 7,000 steps a day was linked to a 30 percent lower risk of heart disease.",
    body:
      "Walking about 7,000 steps a day is linked to a roughly 30 percent lower risk of heart disease compared with walking 2,000 steps, according to a large study of 85,000 adults. Researchers tracked participants wearing step counters for an average of seven years. Benefits increased up to about 9,000 steps, after which gains levelled off.\n\n" +
      "The pace of walking also mattered. People who spent at least 30 minutes a day walking briskly had lower risk than those who took the same number of steps slowly.\n\n" +
      "The authors said the findings suggest the popular target of 10,000 steps is helpful but not essential for most people. Even small increases, such as an extra 1,000 steps a day, were linked to measurable improvements. Because the study was observational, it cannot prove that walking alone caused the benefits, but the results held after accounting for diet, smoking and weight.",
    hoursAgo: 19,
  },
  {
    slug: "telemedicine-rural-clinics",
    topic: "health",
    title: "Telemedicine network connects 150 rural clinics to city specialists",
    excerpt:
      "A telemedicine programme now links 150 rural clinics to specialists in Islamabad and Peshawar, handling 20,000 consultations a month.",
    body:
      "A telemedicine programme now connects 150 rural health clinics with specialist doctors in Islamabad and Peshawar, handling about 20,000 video consultations a month. The network is run by a non-profit health foundation in partnership with provincial health departments. Most consultations involve pregnancy care, skin conditions, diabetes and child health.\n\n" +
      "Each clinic has a trained nurse, a tablet, a portable ultrasound device and a solar-powered internet connection. The foundation says the service has reduced the number of patients travelling more than 100 kilometres to see a specialist by 60 percent.\n\n" +
      "Many of the participating specialists are female doctors who work from home, helping fill a shortage of women physicians in rural areas. Challenges include unreliable mobile signals and limited access to prescribed medicines. The foundation plans to add 100 more clinics next year and introduce electronic health records that patients can carry between facilities.",
    hoursAgo: 26,
  },

  // ---------------------------------------------------------------- climate
  {
    slug: "heatwave-early-warning-cities",
    topic: "climate",
    title: "Cities adopt heatwave action plans after record summer temperatures",
    excerpt:
      "After temperatures topped 50C, several cities are rolling out cooling centres, heat alerts and white-roof programmes.",
    body:
      "Several cities are adopting heatwave action plans after a summer in which temperatures topped 50 degrees Celsius in parts of the country. The plans include colour-coded heat alerts, public cooling centres and changes to working hours for outdoor labourers. Karachi's plan also sets aside funds for free drinking water stations at bus stops and markets.\n\n" +
      "Officials are encouraging white or reflective roof coatings, which can lower indoor temperatures by several degrees. A pilot in a low-income neighbourhood painted 2,000 roofs and recorded fewer heat-related hospital visits than nearby areas.\n\n" +
      "Climate scientists say extreme heat events are becoming more frequent and lasting longer. Doctors warn that elderly people, young children and those with chronic illnesses face the greatest risk. City planners are also looking at planting more trees and protecting green spaces, which help reduce the urban heat island effect over the long term.",
    hoursAgo: 6,
  },
  {
    slug: "mangrove-restoration-indus-delta",
    topic: "climate",
    title: "Mangrove restoration expands along the Indus delta coastline",
    excerpt:
      "Restoration projects have replanted mangroves across thousands of hectares of the Indus delta, helping protect coasts and fisheries.",
    body:
      "Mangrove restoration projects have replanted trees across about 8,000 hectares of the Indus delta coastline over the past five years, according to a provincial forestry report. Mangroves protect coastal villages from storm surges and provide breeding grounds for fish and shrimp. They also store large amounts of carbon in their roots and in the muddy soil beneath them.\n\n" +
      "Local fishing communities have been hired to plant seedlings and guard young trees from grazing camels. Survival rates have improved from around 40 percent in early efforts to more than 70 percent, thanks to better site selection.\n\n" +
      "Scientists caution that mangroves need fresh water and sediment from the river to thrive. Reduced river flow into the delta, caused by upstream dams and irrigation, remains the biggest long-term threat. The forestry department plans to restore another 5,000 hectares and is exploring carbon credit sales to fund the work.",
    hoursAgo: 15,
  },
  {
    slug: "solar-panel-imports-surge",
    topic: "climate",
    title: "Rooftop solar surge reshapes electricity demand as panel imports climb",
    excerpt:
      "Solar panel imports have more than doubled as households and factories install rooftop systems to escape high power bills.",
    body:
      "Imports of solar panels have more than doubled over the past year as households and businesses install rooftop systems to cut high electricity bills. Industry estimates suggest several gigawatts of rooftop solar capacity have been added nationwide, much of it without formal grid connections. Falling panel prices have made a typical home system pay for itself in under three years.\n\n" +
      "The shift is changing daytime electricity demand, with grid consumption dropping sharply around midday in some cities. Power distribution companies say fewer paying customers leaves the remaining users facing higher fixed costs.\n\n" +
      "Energy analysts say the boom is good for emissions and energy security but needs better planning. They recommend adding battery storage and updating net-metering rules so rooftop owners are paid fairly for power they export. The energy regulator is reviewing tariffs and expects to publish proposals for public comment early next year.",
    hoursAgo: 21,
  },

  // ---------------------------------------------------------------- sports
  {
    slug: "psl-draft-overseas-picks",
    topic: "sports",
    title: "PSL draft: franchises spend big on fast bowlers ahead of new cricket season",
    excerpt:
      "Pakistan Super League teams prioritised pace bowlers and finishers in the player draft, with Karachi and Lahore sides making early moves.",
    body:
      "Pakistan Super League franchises focused heavily on fast bowlers and late-order hitters in this year's player draft, held in Lahore on Sunday. Teams made 112 picks across platinum, diamond and gold categories, with overseas players filling about a third of the slots. Several franchises used their first selections on bowlers who can reach 145 kilometres per hour.\n\n" +
      "Karachi's team retained its core batting line-up and added two young spinners from domestic cricket. The Lahore franchise, seeking a third title, picked an all-rounder from the emerging category who impressed in the national T20 cup.\n\n" +
      "Analysts said the draft reflects a shift toward specialist death bowlers as scores in T20 cricket keep rising. Last season's average first-innings total in the PSL was 182, up from 165 three years ago. The tournament begins in February, with matches in Karachi, Lahore, Rawalpindi and Multan.",
    hoursAgo: 1,
  },
  {
    slug: "test-series-spin-wins-decider",
    topic: "sports",
    title: "Spinners bowl hosts to Test series win on a turning pitch in Rawalpindi",
    excerpt:
      "The home side clinched the three-match Test series 2-1 after its spinners took 17 wickets in the deciding match.",
    body:
      "The home team won the deciding third Test by 152 runs in Rawalpindi on Friday, clinching the cricket series 2-1 thanks to its spin bowlers. The two spinners shared 17 of the 20 wickets in the match on a pitch that turned sharply from the second day. The visitors were bowled out for 189 in their second innings, chasing a target of 342.\n\n" +
      "The victory follows a defeat in the first Test, when the touring side's fast bowlers dominated on a greener surface. Selectors then reshaped the team, adding a third spinner and an extra batter.\n\n" +
      "The series win moves the hosts up two places in the World Test Championship standings. Commentators debated whether preparing spin-friendly pitches is fair play or smart use of home conditions. The team's next Test series is away from home in January, where pace and bounce are expected to pose a very different challenge.",
    hoursAgo: 8,
  },
  {
    slug: "football-and-formula-1-weekend-roundup",
    topic: "sports",
    title: "Weekend roundup: late football drama and a tyre gamble that decided the Formula 1 race",
    excerpt:
      "A stoppage-time winner topped the football league, while a one-stop tyre strategy won a rain-hit Formula 1 Grand Prix.",
    body:
      "A stoppage-time header sent the league leaders four points clear at the top of the football table on Saturday, while a bold tyre strategy decided Sunday's Formula 1 Grand Prix. In football, the leaders came from a goal down to win 2-1 away, with their centre-back scoring in the 94th minute. Their closest rivals drew 0-0, despite having 22 shots on goal.\n\n" +
      "In Formula 1, a light rain shower midway through the race split the field on tyre choices. The eventual winner stayed out on worn slick tyres for six laps while others pitted, gaining 12 seconds as the track dried. The win tightens the drivers' championship with five races left.\n\n" +
      "Elsewhere, the national women's football team qualified for a regional tournament for the first time in eight years. The squad, many of whom play club football in Karachi and Islamabad, won its group unbeaten.",
    hoursAgo: 11,
  },

  // ---------------------------------------------------------------- culture
  {
    slug: "lahore-literary-festival-lineup",
    topic: "culture",
    title: "Literary festival returns with 200 speakers and a focus on regional languages",
    excerpt:
      "A three-day literary festival in Lahore will feature 200 speakers, with sessions in Urdu, Punjabi, Sindhi, Pashto and Balochi.",
    body:
      "A three-day literary festival will return to Lahore next month with about 200 speakers and a special focus on writing in regional languages. Organisers say a quarter of the 90 sessions will be held in Punjabi, Sindhi, Pashto, Balochi and Saraiki, alongside Urdu and English. Entry remains free, and the festival expects more than 60,000 visitors.\n\n" +
      "New features include a translation workshop, a children's storytelling tent and a book fair with 40 publishers. A session on digital publishing will look at how audiobooks and online serials are bringing younger readers to Urdu fiction.\n\n" +
      "Organisers said ticket-free events help draw students and families who might not otherwise attend. Security and crowd management plans have been expanded after last year's attendance exceeded expectations. Several sessions will be livestreamed for audiences in Karachi, Islamabad and abroad, with recordings available online after the festival ends.",
    hoursAgo: 9,
  },
  {
    slug: "truck-art-exhibition",
    topic: "culture",
    title: "Truck art moves from highways to gallery walls in new Karachi exhibition",
    excerpt:
      "A Karachi gallery is showing works by 25 truck artists, highlighting a colourful tradition and the craftspeople behind it.",
    body:
      "A gallery in Karachi has opened an exhibition featuring the work of 25 truck artists, bringing the country's famous painted-vehicle tradition indoors. The show includes decorated wooden panels, metal bumpers and full-size truck doors covered in birds, flowers, poetry and portraits. Many of the artists learned the craft as apprentices in workshops along the city's main highways.\n\n" +
      "Curators say the exhibition aims to recognise individual artists, who are rarely credited for their work. Each piece is labelled with the painter's name and workshop, and several artists are giving live demonstrations.\n\n" +
      "Truck art has gained international attention in recent years, appearing on fashion items, furniture and murals. However, workshop owners say demand for traditional truck decoration is falling as transport companies cut costs. Proceeds from sales at the exhibition will go directly to the artists, and the gallery plans to take the show to Lahore in the spring.",
    hoursAgo: 17,
  },
  {
    slug: "streaming-drama-record-viewers",
    topic: "culture",
    title: "Urdu streaming drama breaks viewing records with audiences abroad",
    excerpt:
      "A fictional Urdu drama series, Sheher-e-Khwab, drew 40 million views in its first month, with a third coming from overseas.",
    body:
      "Sheher-e-Khwab, a fictional Urdu drama series about three generations of a family in old Lahore, drew 40 million views in its first month on a streaming platform. About a third of those views came from outside the country, particularly from the Gulf, the United Kingdom and North America. The 20-episode series was released in full rather than weekly, a first for its production studio.\n\n" +
      "Critics praised its shorter episodes, tighter writing and location filming in the walled city. Subtitles in English, Arabic and Turkish helped it reach audiences who do not speak Urdu.\n\n" +
      "Industry observers say the success could encourage producers to move away from long-running television formats with 30 or more episodes. Advertisers, however, still prefer traditional TV, which reaches more households in smaller towns. The studio has announced a second season and plans to film part of it in Karachi.",
    hoursAgo: 23,
  },

  // ---------------------------------------------------------------- gaming
  {
    slug: "esports-tournament-islamabad",
    topic: "gaming",
    title: "Islamabad hosts its largest esports tournament with $100,000 prize pool",
    excerpt:
      "More than 1,500 players competed in an Islamabad esports event featuring fighting games, mobile shooters and strategy titles.",
    body:
      "Islamabad hosted its largest esports tournament over the weekend, with more than 1,500 players competing for a prize pool of $100,000. The event featured fighting games, mobile battle royale shooters and real-time strategy titles. Organisers estimated that 12,000 spectators attended in person, while online streams drew 2 million views.\n\n" +
      "Players from the country have built a strong reputation in fighting games, with several winning major international events in recent years. The mobile game competitions attracted the most entries, reflecting how most gamers in the region play on phones.\n\n" +
      "Organisers said the biggest challenge remains internet latency, which can disadvantage players in online international qualifiers. They called for local game servers and better broadband in smaller cities. A women's division was included for the first time, with 120 participants. The organisers plan a similar event in Karachi next year.",
    hoursAgo: 7,
  },
  {
    slug: "indie-game-studio-lahore-launch",
    topic: "gaming",
    title: "Lahore indie studio's puzzle game sells 300,000 copies in first month",
    excerpt:
      "Fictional studio Kite Hill Games sold 300,000 copies of its hand-drawn puzzle game set in an imagined old city.",
    body:
      "Kite Hill Games, a 12-person indie studio in Lahore, sold 300,000 copies of its puzzle game Rooftops in its first month on PC and consoles. The hand-drawn game follows a kite-flyer solving puzzles across the rooftops of an imagined old city during a spring festival. It holds a 94 percent positive rating from player reviews on a major PC storefront.\n\n" +
      "The studio spent three years developing the game, funded partly by outsourcing art work for other companies. Studio director Hamza Qureshi said the team deliberately used local music, architecture and street sounds to stand out.\n\n" +
      "The success is unusual for a small studio in the region, where most game developers focus on mobile titles or contract work. The team is now hiring eight more developers and plans a mobile version next year. Local industry groups hope it will encourage investors to back more original games from the country.",
    hoursAgo: 14,
  },
  {
    slug: "game-prices-explainer",
    topic: "gaming",
    title: "Explainer: why video game prices are rising and what regional pricing means",
    excerpt:
      "Bigger budgets and longer development times are pushing up game prices, but regional pricing still varies widely by country.",
    body:
      "Video game prices are rising because development budgets for big titles have grown dramatically, but the price players pay still varies widely depending on where they live. Major games can now take five years and several hundred developers to make. Publishers say higher launch prices are needed to cover those costs.\n\n" +
      "Regional pricing allows stores to charge less in countries with lower average incomes. A game priced at $70 in one market may cost the equivalent of $25 to $35 in South Asia. However, currency swings and changes to store policies can cause local prices to jump overnight.\n\n" +
      "Gamers have increasingly turned to subscription services, which offer access to libraries of games for a monthly fee. Others wait for seasonal sales, when discounts can exceed 70 percent. Analysts expect the gap between blockbuster prices and smaller indie games to keep widening, giving players more choice across budgets.",
    hoursAgo: 30,
  },
];
