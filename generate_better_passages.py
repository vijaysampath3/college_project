import json

passages = [
  {
    "id": "tech_1",
    "category": "technology",
    "title": "Artificial Intelligence in Education",
    "difficulty": "medium",
    "text": "The integration of artificial intelligence into educational environments has sparked significant debate among scholars and practitioners. Proponents argue that intelligent tutoring systems can provide personalized feedback, dynamically adapting to a student's unique learning pace. For instance, natural language processing algorithms can analyze written assignments to identify specific grammatical weaknesses, thereby allowing educators to focus their instruction on targeted remediation rather than generalized corrections. However, critics caution against an over-reliance on algorithms. They highlight the risk of diminishing the fundamental human connection that has historically defined the teacher-student relationship. A machine may accurately calculate the probability of a student failing a module, but it cannot empathize with the emotional distress underlying poor academic performance. Furthermore, there are persistent concerns regarding data privacy and the potential for algorithmic bias to inadvertently reinforce existing socioeconomic disparities. Ultimately, the consensus suggests that artificial intelligence should not be viewed as a substitute for human educators. Instead, it must be carefully positioned as a supplementary tool. When implemented responsibly, these technologies have the profound potential to alleviate administrative burdens, democratize access to high-quality educational resources, and empower teachers to dedicate more time to meaningful, individualized mentorship."
  },
  {
    "id": "tech_2",
    "category": "technology",
    "title": "Cybersecurity and Digital Safety",
    "difficulty": "hard",
    "text": "In an increasingly interconnected global economy, the importance of robust cybersecurity infrastructure cannot be overstated. As digital networks expand to encompass critical public utilities, financial systems, and personal communications, the attack surface available to malicious actors has grown exponentially. Modern cyber threats range from sophisticated state-sponsored espionage campaigns to highly coordinated ransomware attacks targeting municipal governments and healthcare providers. Consequently, organizations are compelled to adopt proactive defense strategies, moving beyond traditional perimeter security models. Concepts such as zero-trust architecture, which operates on the principle that no user or device is inherently trustworthy regardless of their network location, are becoming foundational. Furthermore, educating the general public about digital safety is paramount. Phishing schemes and social engineering tactics often exploit human psychology rather than technical vulnerabilities. Therefore, cultivating a culture of security awareness is just as critical as deploying advanced encryption protocols. As we navigate this complex digital landscape, the continuous evolution of protective technologies must remain a top priority to safeguard sensitive data and maintain the integrity of our digital institutions."
  },
  {
    "id": "tech_3",
    "category": "technology",
    "title": "Cloud Computing",
    "difficulty": "easy",
    "text": "Cloud computing has completely transformed the way businesses and individuals store, manage, and process data. Instead of keeping files on a local hard drive or managing physical servers, people can now access their digital resources over the internet. This shift offers remarkable flexibility and cost savings. For a small startup, cloud services mean there is no need to purchase expensive hardware upfront. They can simply rent server space and computing power on demand, scaling up as their user base grows. Moreover, the cloud facilitates global collaboration. Teams located across different continents can work on the same document simultaneously, seeing changes in real time. Popular applications like web-based email, streaming platforms, and online photo galleries all rely on cloud infrastructure to deliver seamless experiences. Despite these tremendous benefits, some organizations still hesitate to fully migrate to the cloud due to concerns about data ownership and reliance on third-party vendors. However, major cloud providers continually enhance their security protocols and offer redundant backup systems, ensuring that cloud computing remains the dominant paradigm for modern computing."
  },
  {
    "id": "tech_4",
    "category": "technology",
    "title": "The Future of Robotics",
    "difficulty": "medium",
    "text": "The field of robotics is advancing rapidly, shifting from clunky assembly line machines to highly sophisticated, autonomous systems. Historically, robots were confined to cages in manufacturing plants, performing repetitive tasks that required precision and endurance. Today, collaborative robots, or \"cobots,\" are designed to operate safely alongside human workers, assisting with complex assembly processes and logistics. Beyond the factory floor, robotic applications are expanding into healthcare, where surgical robots enable minimally invasive procedures with unprecedented accuracy. In the agricultural sector, autonomous drones and harvesting robots are optimizing crop yields and reducing reliance on manual labor. A key driver of this robotic revolution is the integration of machine learning and advanced sensor technology. Modern robots can interpret visual data, navigate unpredictable environments, and adapt to changing circumstances without explicit human programming. However, this rapid automation raises important socioeconomic questions. As machines become capable of performing tasks previously reserved for humans, societies must address the potential displacement of workers and consider new educational paradigms to prepare future generations for a highly automated workforce."
  },
  {
    "id": "tech_5",
    "category": "technology",
    "title": "Internet of Things",
    "difficulty": "easy",
    "text": "The Internet of Things, commonly known as IoT, refers to the growing network of physical objects connected to the internet. These objects range from ordinary household items, like smart thermostats and light bulbs, to complex industrial machinery. By embedding sensors and communication chips into everyday devices, they can collect and exchange data without requiring human intervention. In a smart home environment, IoT allows a refrigerator to track expiration dates or a heating system to learn a family's daily schedule, automatically adjusting the temperature to save energy. On a larger scale, cities are utilizing IoT technology to monitor traffic flow, manage waste collection efficiently, and reduce urban energy consumption. Wearable fitness trackers are another popular example, seamlessly syncing health metrics to smartphones. While the convenience is undeniable, the sheer volume of data generated by billions of connected devices presents significant challenges. Ensuring privacy and protecting these interconnected networks from cyberattacks are critical issues that developers must address as the Internet of Things continues to weave itself into the fabric of daily life."
  },
  {
    "id": "sci_1",
    "category": "science",
    "title": "Renewable Energy",
    "difficulty": "medium",
    "text": "The global transition toward renewable energy sources represents one of the most critical challenges and opportunities of the 21st century. As the detrimental impacts of fossil fuel consumption become increasingly apparent, nations are prioritizing sustainable alternatives to power their economies. Solar and wind energy have emerged as the primary pillars of this transition, driven by significant technological advancements and plunging manufacturing costs. Large-scale solar farms and offshore wind turbines are now capable of generating electricity at prices competitive with traditional coal and natural gas plants. However, the intermittent nature of sunshine and wind necessitates the development of advanced energy storage solutions. High-capacity lithium-ion batteries and innovative grid-scale storage methods are essential to ensure a reliable and continuous power supply. Additionally, upgrading aging electrical grids to accommodate decentralized energy production is a massive infrastructural undertaking. Despite these logistical hurdles, the environmental imperatives are clear. By embracing renewable energy, societies can significantly reduce greenhouse gas emissions, mitigate the severe effects of climate change, and establish a more resilient and sustainable energy future for generations to come."
  },
  {
    "id": "sci_2",
    "category": "science",
    "title": "Space Exploration",
    "difficulty": "easy",
    "text": "Space exploration has always captured the human imagination, inspiring generations to look up at the stars and wonder what lies beyond our planet. For decades, government agencies like NASA led the charge, sending astronauts to the Moon and launching satellites to study distant galaxies. Recently, however, a new era has begun with the rise of private space companies. These ambitious corporations are developing reusable rockets, significantly lowering the astronomical costs traditionally associated with space travel. This commercialization of space has accelerated plans for returning humans to the lunar surface and eventually establishing a permanent colony on Mars. Beyond the thrill of exploration, studying space provides practical benefits here on Earth. Satellites monitor global weather patterns, enable worldwide communication, and help scientists track environmental changes. While the vast distances and harsh conditions of space present extreme technical challenges, the continuous push to explore the cosmos drives technological innovation, expanding our understanding of the universe and humanity's place within it."
  },
  {
    "id": "sci_3",
    "category": "science",
    "title": "Genetic Engineering",
    "difficulty": "hard",
    "text": "The advent of precision genetic engineering, particularly the development of CRISPR-Cas9 technology, has revolutionized the biological sciences. This groundbreaking tool allows scientists to edit genomic sequences with unprecedented accuracy, efficiency, and affordability. By utilizing a specialized enzyme guided by synthetic RNA, researchers can target specific DNA sequences, enabling them to remove, alter, or insert genetic material. The implications for medicine are profound. Genetic engineering holds the promise of curing inherited genetic disorders, such as cystic fibrosis and sickle cell anemia, by correcting the underlying mutations at their source. Furthermore, it is transforming agriculture through the creation of genetically modified crops that exhibit enhanced resistance to pests, diseases, and extreme environmental stressors. However, this immense power is accompanied by complex ethical dilemmas. The possibility of making heritable changes to the human germline raises profound concerns regarding unforeseen long-term consequences and the potential exacerbation of societal inequalities. Consequently, the international scientific community continues to engage in rigorous debates to establish comprehensive ethical frameworks and regulatory guidelines governing the application of these powerful genomic editing tools."
  },
  {
    "id": "sci_4",
    "category": "science",
    "title": "Ocean Research",
    "difficulty": "medium",
    "text": "Despite covering over seventy percent of the Earth's surface, the world's oceans remain largely unexplored, harboring vast ecosystems and geological features that are yet to be fully understood. Oceanographic research is crucial for comprehending global climate systems, as oceans absorb a significant portion of the carbon dioxide emitted by human activities and regulate global temperatures through complex current networks. Modern marine biologists and geologists utilize advanced technologies, including remotely operated vehicles and autonomous underwater gliders, to map the ocean floor and study life in the extreme pressures of the deep sea. These expeditions routinely discover previously unknown species thriving in the dark, mineral-rich environments surrounding hydrothermal vents. However, the oceans are currently facing unprecedented threats from pollution, overfishing, and climate change. The rising acidity of seawater, caused by excessive carbon absorption, severely impacts marine organisms with calcium carbonate shells, threatening the foundation of the marine food web. Consequently, expanding our knowledge through dedicated ocean research is vital for developing effective conservation strategies and ensuring the long-term health of these critical aquatic ecosystems."
  },
  {
    "id": "sci_5",
    "category": "science",
    "title": "Medical Innovations",
    "difficulty": "easy",
    "text": "Medical innovations have dramatically improved human health and increased life expectancy over the past century. From the discovery of antibiotics to the development of life-saving vaccines, science has continuously found ways to combat deadly diseases. Today, medical research is advancing faster than ever, focusing on personalized treatments and minimally invasive procedures. One exciting area of innovation is the use of 3D printing in medicine. Doctors can now use a patient's scans to print custom-fitted prosthetics and surgical models, allowing for precise planning before an operation even begins. Another major breakthrough is the development of targeted therapies for cancer, which attack specific cancer cells without harming healthy tissue, significantly reducing the severe side effects associated with traditional chemotherapy. Telemedicine has also transformed healthcare delivery, enabling patients in remote areas to consult with specialists via video calls. As technology and biology continue to merge, these incredible medical advancements promise to provide more effective, accessible, and individualized care, further enhancing the quality of life for people around the world."
  },
  {
    "id": "env_1",
    "category": "environment",
    "title": "Climate Change",
    "difficulty": "hard",
    "text": "Climate change constitutes the most pervasive and multifaceted environmental crisis of the modern era, fundamentally driven by the anthropogenic emission of greenhouse gases. The accumulated carbon dioxide and methane in the atmosphere have initiated an accelerated warming trend, precipitating a cascade of severe ecological disruptions. The rapid retreat of polar ice caps and alpine glaciers contributes directly to rising global sea levels, posing an existential threat to low-lying coastal communities and island nations. Furthermore, the increased thermal energy trapped within the climate system is significantly altering established atmospheric circulation patterns, resulting in more frequent and intense extreme weather events, including prolonged droughts, torrential precipitation, and devastating hurricanes. The disruption of these delicate climatic balances also threatens global biodiversity, as many species find themselves unable to adapt to the rapid shift in their natural habitats. Addressing this monumental challenge requires an unprecedented level of international cooperation. Mitigating the worst impacts of climate change demands a comprehensive restructuring of global economic systems, a rapid decarbonization of energy production, and an unwavering commitment to sustainable ecological practices."
  },
  {
    "id": "env_2",
    "category": "environment",
    "title": "Water Conservation",
    "difficulty": "medium",
    "text": "Freshwater is an indispensable resource for human survival, agriculture, and industry, yet it remains finite and increasingly scarce in many regions worldwide. Population growth, rapid urbanization, and inefficient agricultural practices place immense pressure on available water supplies. Aquifers are being depleted faster than natural hydrological cycles can replenish them, leading to severe water stress and ecological degradation. Consequently, water conservation has transitioned from an environmental ideal to an urgent socioeconomic necessity. Implementing efficient irrigation techniques, such as drip irrigation, can drastically reduce agricultural water consumption, which accounts for the vast majority of global usage. In urban environments, modernizing infrastructure to prevent leakages and promoting the use of low-flow appliances are vital conservation strategies. Furthermore, wastewater recycling and desalination technologies offer innovative, albeit energy-intensive, methods for augmenting freshwater supplies in arid regions. Ultimately, fostering a deeper cultural appreciation for water and adopting stringent conservation policies are essential steps toward ensuring long-term water security and preventing future conflicts over this vital natural resource."
  },
  {
    "id": "env_3",
    "category": "environment",
    "title": "Sustainable Agriculture",
    "difficulty": "easy",
    "text": "Sustainable agriculture is an approach to farming that focuses on producing food while protecting the environment and preserving natural resources. Traditional industrial farming often relies heavily on chemical fertilizers and pesticides, which can degrade soil quality and pollute nearby water sources. In contrast, sustainable farming utilizes natural methods to maintain healthy soil and control pests. Techniques like crop rotation, where different types of plants are grown in the same area across different seasons, help prevent the depletion of essential nutrients in the earth. Additionally, using compost and natural fertilizers enriches the soil without introducing harmful chemicals into the ecosystem. Another important aspect of sustainable agriculture is reducing water usage by employing smarter irrigation methods and collecting rainwater. By prioritizing biodiversity and ecological balance, sustainable farms can produce nutritious crops while ensuring that the land remains fertile for future generations. This mindful approach to food production is essential for supporting a growing global population without causing irreversible damage to our fragile planet."
  },
  {
    "id": "env_4",
    "category": "environment",
    "title": "Forest Ecosystems",
    "difficulty": "medium",
    "text": "Forest ecosystems are incredibly complex biological communities that play an essential role in sustaining life on Earth. These vast woodlands cover nearly a third of the planet's landmass and serve as critical carbon sinks, absorbing immense quantities of atmospheric carbon dioxide through the process of photosynthesis. This natural carbon sequestration is a vital defense mechanism against the escalating threats of global climate change. Furthermore, forests are the primary terrestrial reservoirs of biodiversity, providing complex habitats for countless species of flora and fauna, many of which remain undiscovered by science. The intricate root systems of trees also prevent soil erosion, regulate local hydrological cycles, and naturally filter water supplies. Despite their critical importance, forests face relentless destruction driven by commercial logging, agricultural expansion, and urban development. Deforestation not only releases stored carbon back into the atmosphere but also drives countless species toward extinction. Consequently, implementing rigorous conservation strategies and promoting sustainable forestry management are imperative actions to preserve these irreplaceable ecosystems for future generations."
  },
  {
    "id": "env_5",
    "category": "environment",
    "title": "Urban Green Spaces",
    "difficulty": "easy",
    "text": "As cities continue to grow and expand, incorporating urban green spaces has become increasingly important for maintaining a high quality of life. Urban green spaces include public parks, community gardens, tree-lined streets, and even rooftop greenery. These natural areas offer residents a much-needed escape from the concrete, noise, and fast pace of city living. Spending time in nature has been proven to reduce stress, lower blood pressure, and improve overall mental health. Beyond human well-being, green spaces provide substantial environmental benefits. Trees and plants act as natural air filters, absorbing harmful pollutants and producing fresh oxygen. They also help reduce the \"urban heat island\" effect by providing shade and cooling the surrounding air, making cities more comfortable during hot summer months. Furthermore, parks offer habitats for local wildlife, such as birds and beneficial insects, right in the middle of bustling neighborhoods. By prioritizing the creation and maintenance of these green areas, city planners can create healthier, more vibrant, and sustainable communities for everyone."
  },
  {
    "id": "edu_1",
    "category": "education",
    "title": "Online Learning",
    "difficulty": "medium",
    "text": "The rapid expansion of online learning platforms has fundamentally disrupted traditional educational paradigms, offering unprecedented access to knowledge for students worldwide. Digital classrooms transcend geographical limitations, enabling individuals in remote or underserved areas to participate in courses taught by leading academic experts. This modality provides significant flexibility, allowing adult learners and working professionals to balance their educational pursuits with existing occupational responsibilities. However, the efficacy of online learning relies heavily on robust technological infrastructure and reliable internet connectivity. The \"digital divide\" highlights the socioeconomic disparities that can prevent marginalized students from fully engaging in remote education. Furthermore, the absence of physical proximity presents unique pedagogical challenges. Maintaining student engagement and fostering a sense of academic community requires educators to employ innovative, interactive digital strategies. While online learning lacks the spontaneous social interactions characteristic of traditional campuses, its ability to democratize access to education ensures it will remain a permanent and evolving component of the global educational landscape."
  },
  {
    "id": "edu_2",
    "category": "education",
    "title": "Personalized Education",
    "difficulty": "hard",
    "text": "The conceptual shift toward personalized education represents a significant departure from the standardized, \"one-size-fits-all\" instructional models that dominated the twentieth century. Recognizing that cognitive development and learning styles vary profoundly among individuals, educators are increasingly leveraging data analytics and adaptive learning technologies to tailor curricular experiences to the specific needs of each student. This pedagogical approach entails dynamic pacing, where learners progress through academic material based on their demonstrated mastery rather than arbitrary chronological schedules. Sophisticated diagnostic algorithms continuously assess student performance, identifying discrete knowledge gaps and automatically adjusting the difficulty of subsequent instructional modules to maintain an optimal cognitive load. Consequently, advanced students are provided with rigorous enrichment opportunities, while struggling learners receive targeted interventions precisely when required. Implementing personalized education, however, necessitates a substantial transformation in the role of the teacher, transitioning them from primary content deliverers to sophisticated facilitators of individualized learning pathways. This evolution demands ongoing professional development and significant institutional investment in adaptive technological infrastructure."
  },
  {
    "id": "edu_3",
    "category": "education",
    "title": "Digital Classrooms",
    "difficulty": "easy",
    "text": "Digital classrooms are changing the way students learn and interact with their teachers. Instead of relying solely on heavy textbooks and traditional chalkboards, modern classrooms are equipped with interactive smartboards, tablets, and educational software. This technology brings lessons to life, allowing teachers to use engaging videos, interactive simulations, and colorful digital presentations to explain complex concepts. For example, rather than just reading about the solar system, students can explore a 3D model of the planets on their devices. Digital tools also make it easier for students to organize their work. Assignments can be submitted online, and teachers can provide quick, typed feedback directly on the digital document. Furthermore, educational software often includes fun, game-like activities that make practicing math or spelling much more enjoyable. While technology is incredibly helpful, it is important to remember that computers cannot replace the encouragement and guidance of a good teacher. The best digital classrooms use technology to support the teacher's lessons, making learning more exciting and accessible for everyone."
  },
  {
    "id": "edu_4",
    "category": "education",
    "title": "Lifelong Learning",
    "difficulty": "easy",
    "text": "The concept of lifelong learning suggests that education does not stop when a person graduates from high school or college. In today's rapidly changing world, continuing to learn new skills and acquire new knowledge is more important than ever. As technology advances and new industries emerge, the types of jobs available are constantly shifting. Therefore, professionals must regularly update their skills to remain competitive in the workforce. Lifelong learning can take many forms, from attending formal workshops and taking online certificate courses to simply reading books or watching instructional videos. Beyond career advancement, continuous learning keeps the mind sharp and active, contributing to better cognitive health in older age. It also allows individuals to explore new hobbies and passions, whether that means learning a new language, discovering how to play a musical instrument, or studying history. By embracing a mindset of curiosity and remaining open to new ideas, individuals can enrich their personal lives and adapt successfully to an ever-evolving world."
  },
  {
    "id": "edu_5",
    "category": "education",
    "title": "Collaborative Learning",
    "difficulty": "medium",
    "text": "Collaborative learning is an instructional methodology that emphasizes the importance of social interaction and peer-to-peer engagement in the educational process. Unlike traditional lecture-based formats, collaborative learning requires students to work together in small groups to solve complex problems, complete projects, or analyze academic texts. This approach is rooted in the cognitive theory that learners construct deeper understanding when they articulate their ideas and critically evaluate the perspectives of others. Through active debate and joint problem-solving, students develop essential communication and interpersonal skills that are highly valued in the modern workforce. Furthermore, collaborative environments encourage a sense of shared responsibility, as the success of the group depends on the active participation of each member. Teachers act as facilitators in this model, guiding discussions and providing support rather than simply transmitting information. While managing group dynamics and ensuring equitable participation can present challenges, the benefits of collaborative learning are substantial, fostering critical thinking, empathy, and a more engaging classroom atmosphere."
  },
  {
    "id": "inn_1",
    "category": "innovation",
    "title": "Smart Cities",
    "difficulty": "hard",
    "text": "The conceptualization and development of smart cities represent a sophisticated integration of urban planning, advanced data analytics, and the Internet of Things (IoT). As global populations increasingly concentrate within metropolitan areas, municipal administrations face profound challenges regarding resource allocation, traffic congestion, and environmental sustainability. Smart cities address these systemic issues by deploying extensive networks of environmental sensors and ubiquitous connectivity to continuously monitor and optimize urban infrastructure. For instance, intelligent traffic management systems utilize real-time vehicular data to dynamically adjust signal timings, thereby reducing congestion and lowering localized greenhouse gas emissions. Similarly, intelligent utility grids autonomously balance energy distribution based on predictive consumption models, maximizing efficiency. However, the pervasive nature of this urban surveillance infrastructure introduces profound civic complexities. The continuous collection of granular behavioral data necessitates rigorous data governance frameworks to safeguard citizen privacy and prevent the misuse of personal information. Successfully navigating the tension between technological optimization and fundamental civil liberties remains the paramount challenge in realizing the transformative potential of the smart city paradigm."
  },
  {
    "id": "inn_2",
    "category": "innovation",
    "title": "3D Printing",
    "difficulty": "medium",
    "text": "Three-dimensional printing, also known as additive manufacturing, is fundamentally transforming traditional production methods across a wide array of industries. Unlike subtractive manufacturing, which involves cutting away material from a larger block, 3D printing builds objects layer by precise layer using digital blueprints. This revolutionary approach allows for the creation of incredibly complex geometries that would be impossible or prohibitively expensive to produce using conventional molds or machining techniques. In aerospace and automotive engineering, 3D printing is utilized to manufacture lightweight, high-strength components that improve fuel efficiency. In the medical field, it enables the production of custom-fitted prosthetics and precise anatomical models used by surgeons for pre-operative planning. The technology is also democratizing manufacturing, allowing small businesses and individual inventors to rapidly prototype their ideas without requiring massive upfront capital investments in factory tooling. As printing materials continue to evolve—ranging from durable plastics to advanced metal alloys and even biological tissues—the potential applications of additive manufacturing appear virtually limitless, promising to shorten supply chains and redefine global production logistics."
  },
  {
    "id": "inn_3",
    "category": "innovation",
    "title": "Electric Vehicles",
    "difficulty": "easy",
    "text": "Electric vehicles, or EVs, are rapidly changing the way people travel, offering a cleaner and quieter alternative to traditional gas-powered cars. Instead of relying on an internal combustion engine that burns fossil fuels, electric vehicles are powered by large, rechargeable battery packs. Because they do not have an exhaust pipe, EVs produce zero tailpipe emissions, which significantly reduces air pollution in busy cities. The technology behind electric cars has improved dramatically in recent years. Modern batteries can store much more energy, allowing drivers to travel hundreds of miles on a single charge. Furthermore, the number of public charging stations is growing quickly, making it easier for people to take long road trips. While the initial purchase price of an electric car can be higher, owners often save money over time because electricity is generally cheaper than gasoline, and electric motors require far less maintenance than complex gas engines. As automotive companies continue to innovate, electric vehicles are becoming the standard for the future of sustainable transportation."
  },
  {
    "id": "inn_4",
    "category": "innovation",
    "title": "Entrepreneurship",
    "difficulty": "easy",
    "text": "Entrepreneurship is the process of developing, organizing, and running a new business venture, often in the face of uncertainty and risk. Entrepreneurs are individuals who identify a problem or a gap in the market and create innovative solutions to address it. They are the driving force behind new products, creative services, and technological advancements. Starting a business requires a unique combination of creativity, determination, and practical planning. An entrepreneur must figure out how to secure funding, build a dedicated team, and successfully market their idea to potential customers. While many new businesses face significant challenges and some inevitably fail, the entrepreneurial spirit is essential for economic growth. Successful startups create new jobs, stimulate local economies, and encourage healthy competition, which ultimately leads to better products for consumers. Whether it is a small local bakery or a massive tech company, entrepreneurship encourages people to think outside the box and turn their unique visions into reality, continuously pushing society forward."
  },
  {
    "id": "inn_5",
    "category": "innovation",
    "title": "Future Technologies",
    "difficulty": "medium",
    "text": "As we look toward the horizon of technological advancement, several emerging fields hold the potential to dramatically reshape human society. Quantum computing, for example, utilizes the strange principles of quantum mechanics to process information at speeds millions of times faster than classical supercomputers. This immense computational power could accelerate the discovery of new life-saving pharmaceuticals and solve incredibly complex logistical problems. Simultaneously, advancements in brain-computer interfaces seek to establish direct communication pathways between the human mind and external devices. While still in its infancy, this technology offers profound hope for restoring mobility to individuals with severe paralysis. In the realm of transportation, the development of hyperloop systems—which propel passenger pods through near-vacuum tubes at supersonic speeds—could revolutionize long-distance travel, drastically reducing commute times between major cities. However, the rapid pace of these innovations demands careful ethical consideration. Society must proactively establish regulatory frameworks to ensure that these powerful new technologies are deployed responsibly, maximizing their benefit to humanity while mitigating potential risks and preventing the exacerbation of global inequalities."
  }
]

for p in passages:
    words = p["text"].split()
    wc = len(words)
    p["wordCount"] = wc
    
    # Target WPM based on difficulty
    if p["difficulty"] == "easy":
        wpm = 130
    elif p["difficulty"] == "medium":
        wpm = 150
    else:
        wpm = 170
        
    p["targetWPM"] = wpm
    
    # Expected reading time in seconds
    p["expectedReadingTime"] = int((wc / wpm) * 60)
    p["comprehensionQuestions"] = []

with open('src/data/reading-passages.json', 'w') as f:
    json.dump(passages, f, indent=2)

print("Generated completely new JSON!")
