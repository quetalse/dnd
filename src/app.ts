
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectsStatus
    ) {

    }
}

type Listener = (items: Project[]) => void;

// State
class StateManager{
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: StateManager;

    private constructor() {

    }

    static getInstance() {
        if(this.instance) return this.instance;
        this.instance = new StateManager();
        return this.instance;
    }

    addListener(fn: Listener){
        this.listeners.push(fn)
    }

    addProject(title: string, description: string, numOfPeople: number){
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectsStatus.Active);

        this.projects.push(newProject);

        for (const fn of this.listeners){
            fn(this.projects.slice());
        }
    }
}

enum ProjectsStatus { Active, Finished}


const projectState = StateManager.getInstance();

interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatble: Validatable){
    let isValid = true;
    if(validatble.required){
        isValid = isValid && validatble.value.toString().trim().length !== 0;
    }
    if(validatble.minLength != null && typeof validatble.value === 'string'){
        isValid = isValid &&  validatble.value.trim().length > validatble.minLength;
    }
    if(validatble.maxLength != null && typeof validatble.value === 'string'){
        isValid = isValid &&  validatble.value.trim().length < validatble.maxLength;
    }
    if(validatble.min != null && typeof validatble.value === 'number'){
        isValid = isValid && validatble.value >= validatble.min;
    }
    if(validatble.max != null && typeof validatble.value === 'number'){
        isValid = isValid && validatble.value <= validatble.max;
    }
    return isValid;
}

function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    return {
        configurable: true,
        get(){
            return originalMethod.bind(this);
        }
    } as PropertyDescriptor;
}

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement; // section element
    assignedProject: Project[] = []


    constructor(private type: 'active' | 'finished') {
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-list')!;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;


        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: Project[]) => {
            this.assignedProject = projects;
            this.renderProjects();
        })

        this.attach();
        this.renderContent();
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        for( const project of this.assignedProject){
            const listItem = document.createElement('li');
            listItem.textContent = project.title;
            listEl.appendChild(listItem)
        }
    }

    private renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private attach(){
        this.hostElement.insertAdjacentElement('beforeend',  this.element);
    }
}

class ProjectInput {

    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;


        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

        this.attach();

        this.configure();
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,
        };

        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };

        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if(
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ){
            alert('Invalid input!');
            return;
        }else{
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInputs(){
        this.peopleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.titleInputElement.value = '';
    }

    @AutoBind
    private submitHandler(event: Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();

        if(Array.isArray(userInput)){
            const [title, description, people] = userInput;

            projectState.addProject(title, description, people)

            this.clearInputs();
        }
    }

    private configure(){
        this.element.addEventListener('submit', this.submitHandler)
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin',  this.element);
    }
}

const project = new ProjectInput();
const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');


console.log(project)